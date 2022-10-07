import { BigNumber, Contract, ethers } from "ethers";
import { BaseSDK } from "../base/sdk";

const FV_LOGIN_MSG = `Sign this message to login into GoodDollar Unique Identity service.
WARNING: do not sign this message unless you trust the website/application requesting this signature.
nonce:`;

const FV_IDENTIFIER_MSG = `Sign this message to create your own unique identifier for your anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`;

const FV_IDENTIFIER_MSG2 = `Sign this message to request verifying your account <account> and to create your own secret unique identifier for your anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`;

export class ClaimSDK extends BaseSDK {
  async generateFVLink(firstName: string, callbackUrl?: string, popupMode: boolean = false) {
    const steps = this.getFVLink();
    await steps.getLoginSig();
    await steps.getFvSig();
    return steps.getLink(firstName, callbackUrl, popupMode);
  }

  getFVLink() {
    let loginSig: string, fvSig: string, nonce: string, account: string;
    const getLoginSig = async () => {
      nonce = (Date.now() / 1000).toFixed(0);
      console.log({ provider: this.provider });
      return (loginSig = await this.provider.getSigner().signMessage(FV_LOGIN_MSG + nonce));
    };
    const getFvSig = async () => {
      const account = await this.provider.getSigner().getAddress();
      return (fvSig = await this.provider.getSigner().signMessage(FV_IDENTIFIER_MSG2.replace("<account>", account)));
    };
    const getLink = (firstName: string, callbackUrl?: string, popupMode: boolean = false) => {
      if (!fvSig) throw new Error("missing login or identifier signature");
      const params = new URLSearchParams();
      params.append("nonce", nonce);
      params.append("firstname", firstName);
      params.append("sig", loginSig);
      params.append("fvsig", fvSig);
      params.append("account", account);
      let url = this.env.identityUrl;
      if (popupMode === false && !callbackUrl) {
        throw new Error("redirect url is missing for redirect mode");
      }
      if (callbackUrl) {
        params.append(popupMode ? "cbu" : "rdu", callbackUrl);
      }
      url += "?" + params.toString();
      return url;
    };
    return { getLoginSig, getFvSig, getLink };
  }

  async isAddressVerified(address: string): Promise<boolean> {
    const identity = this.getContract("Identity");
    return identity.isWhitelisted(address);
  }

  async checkEntitlement(address?: string): Promise<BigNumber> {
    const ubi = this.getContract("UBIScheme");
    const result = await (address ? ubi["checkEntitlement(address)"](address) : ubi["checkEntitlement()"]()).catch(e =>
      BigNumber.from("0")
    );
    return result;
  }

  async getNextClaimTime() {
    const DAY = 1000 * 60 * 60 * 24;
    const ubi = this.getContract("UBIScheme");
    const [periodStart, currentDay] = await Promise.all([ubi.periodStart(), ubi.currentDay()]);
    let startRef = new Date(periodStart.toNumber() * 1000 + currentDay.toNumber() * DAY);
    if (startRef < new Date()) {
      startRef = new Date(periodStart.toNumber() * 1000 + (currentDay.toNumber() + 1) * DAY);
    }
    return startRef;
  }

  async claim() {
    const ubi = this.getContract("UBIScheme");
    return ubi.claim();
  }
}
