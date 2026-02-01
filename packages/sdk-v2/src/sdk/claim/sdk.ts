import { BigNumber } from "ethers";
import { invokeMap } from "lodash";
import { compressToEncodedURIComponent } from "lz-string";

import { fvAuth, g$Response, g$AuthRequest } from "../goodid/";
import { BaseSDK } from "../base/sdk";
import { FV_LOGIN_MSG, FV_IDENTIFIER_MSG2 } from "../constants";

const DAY = 1000 * 60 * 60 * 24;

export class ClaimSDK extends BaseSDK {
  async generateFVLink(firstName: string, callbackUrl?: string, popupMode = false, chainId?: number) {
    const steps = this.getFVLink(chainId);

    await steps.getFvSig();

    return steps.getLink(firstName, callbackUrl, popupMode);
  }

  getFVLink(chainId?: number) {
    let loginSig: string, fvSig: string, nonce: string, account: string;
    const defaultChainId = chainId;
    const { env, provider } = this ?? {};
    const signer = provider.getSigner();
    const { identityUrl } = env ?? {};

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

      if (callbackUrl) {
        params[popupMode ? "cbu" : "rdu"] = callbackUrl;
      }
      searchParams.append("lz", compressToEncodedURIComponent(JSON.stringify(params)));
      return url.toString();
    };

    const deleteFvId = async () => {
      await this.deleteFVRecord();
    };

    return { getLoginSig, getFvSig, getLink, deleteFvId };
  }

  /**
   * Get the whitelisted root address for a given address.
   * This supports connected wallets by returning the main whitelisted wallet address.
   * @param address - The address to check (can be main wallet or connected wallet)
   * @returns The whitelisted root address, or 0x0 if not whitelisted/connected
   */
  async getWhitelistedRootAddress(address: string): Promise<string> {
    const identity = this.getContract("Identity");

    try {
      const rootAddress = await identity.getWhitelistedRoot(address);
      return rootAddress;
    } catch (error) {
      console.error("Error getting whitelisted root:", error);
      return "0x0000000000000000000000000000000000000000";
    }
  }

  /**
   * Check if an address is verified (whitelisted or connected to a whitelisted account).
   * @param address - The address to check
   * @returns true if the address is whitelisted or connected to a whitelisted account
   */
  async isAddressVerified(address: string): Promise<boolean> {
    const rootAddress = await this.getWhitelistedRootAddress(address);
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    return rootAddress !== zeroAddress;
  }

  /**
   * Check entitlement for an address.
   * For connected wallets, this checks entitlement against the whitelisted root address.
   * @param address - Optional address to check (if not provided, uses connected wallet)
   * @returns The entitlement amount as BigNumber
   */
  async checkEntitlement(address?: string): Promise<BigNumber> {
    const ubi = this.getContract("UBIScheme");

    try {
      if (address) {
        // Get the whitelisted root address to support connected wallets
        const rootAddress = await this.getWhitelistedRootAddress(address);
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        // If not whitelisted/connected, return 0
        if (rootAddress === zeroAddress) {
          return BigNumber.from("0");
        }

        // Check entitlement for the root address (main whitelisted wallet)
        return await ubi["checkEntitlement(address)"](rootAddress);
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
    const { devEnv, env, provider } = this;
    const { backend } = env;
    const signer = provider.getSigner();

    const { token, fvsig } = await fvAuth(devEnv, signer);
    const endpoint = `${backend}/verify/face/${encodeURIComponent(fvsig)}`;

    return fetch(endpoint, g$AuthRequest(token, { fvsig })).then(g$Response);
  }
}
