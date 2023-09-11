import { BigNumber } from "ethers";
import { invokeMap, forIn } from "lodash";
import { BaseSDK } from "../base/sdk";

const DAY = 1000 * 60 * 60 * 24;

const FV_LOGIN_MSG = `Sign this message to login into GoodDollar Unique Identity service.
WARNING: do not sign this message unless you trust the website/application requesting this signature.
nonce:`;

const FV_IDENTIFIER_MSG2 = `Sign this message to request verifying your account <account> and to create your own secret unique identifier for your anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`;

export class ClaimSDK extends BaseSDK {
  async generateFVLink(firstName: string, callbackUrl?: string, popupMode = false, chainId?: number) {
    const steps = this.getFVLink(chainId);

    await steps.getFvSig();

    return steps.getLink(firstName, callbackUrl, popupMode);
  }

  getFVLink(chainId?: number) {
    let loginSig: string, fvSig: string, nonce: string, account: string;
    const defaultChainId = chainId;
    const { env, provider } = this;
    const signer = provider.getSigner();
    const { identityUrl } = env;

    const getLoginSig = async () => {
      nonce = (Date.now() / 1000).toFixed(0);
      loginSig = await signer.signMessage(FV_LOGIN_MSG + nonce);

      return loginSig;
    };

    const getFvSig = async () => {
      account = await signer.getAddress();
      fvSig = await signer.signMessage(FV_IDENTIFIER_MSG2.replace("<account>", account));

      return fvSig;
    };

    const getLink = (
      firstName: string,
      callbackUrl?: string,
      popupMode = false,
      chainId: number | undefined = defaultChainId
    ) => {
      if (!fvSig) {
        throw new Error("missing login or identifier signature");
      }

      if (popupMode === false && !callbackUrl) {
        throw new Error("redirect url is missing for redirect mode");
      }

      const url = new URL(identityUrl);
      const { searchParams } = url;

      const params = {
        account,
        nonce,
        fvsig: fvSig,
        firstname: firstName,
        sg: loginSig,
        chain: chainId
      };

      forIn(params, (value, param) => {
        if (!value) {
          return;
        }

        searchParams.append(param, String(value));
      });

      if (callbackUrl) {
        searchParams.append(popupMode ? "cbu" : "rdu", callbackUrl);
      }

      return url.toString();
    };

    const deleteFvId = async () => {
      await this.deleteFVRecord();
    };

    return { getLoginSig, getFvSig, getLink, deleteFvId };
  }

  async isAddressVerified(address: string): Promise<boolean> {
    const identity = this.getContract("Identity");

    return identity.isWhitelisted(address);
  }

  async checkEntitlement(address?: string): Promise<BigNumber> {
    const ubi = this.getContract("UBIScheme");

    try {
      if (address) {
        return await ubi["checkEntitlement(address)"](address);
      }

      return await ubi["checkEntitlement()"]();
    } catch {
      return BigNumber.from("0");
    }
  }

  async getNextClaimTime() {
    const ubi = this.getContract("UBIScheme");
    const [periodStart, currentDay] = await Promise.all([ubi.periodStart(), ubi.currentDay()]).then(values =>
      invokeMap(values, "toNumber")
    );

    let startRef = new Date(periodStart * 1000 + currentDay * DAY);

    if (startRef < new Date()) {
      startRef = new Date(startRef.getTime() + DAY);
    }

    return startRef;
  }

  async claim(txOverrides?: object) {
    const ubi = this.getContract("UBIScheme");

    return ubi.claim(txOverrides);
  }

  async deleteFVRecord() {
    const { env, provider } = this;
    const signer = provider.getSigner();
    const { backend } = env;

    const account = await signer.getAddress();
    const signature = await signer.signMessage(FV_IDENTIFIER_MSG2.replace("<account>", account));
    const enrollmentIdentifier = signature.slice(0, 42);
    const endpoint = `${backend}/verify/face/${encodeURIComponent(enrollmentIdentifier)}`;
    const authEndpoint = `${backend}/auth/fv2`;
    const { token } = await fetch(authEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fvsig: signature, account })
    }).then(_ => _.json());

    return fetch(endpoint, {
      method: "DELETE",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ signature })
    }).then(_ => _.json());
  }
}
