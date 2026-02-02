import { BigNumber } from "ethers";
import { invokeMap } from "lodash";
import { compressToEncodedURIComponent } from "lz-string";

import { fvAuth, g$Response, g$AuthRequest } from "../goodid/";
import { BaseSDK } from "../base/sdk";
import { FV_LOGIN_MSG, FV_IDENTIFIER_MSG2 } from "../constants";

const DAY = 1000 * 60 * 60 * 24;

import { isValidWhitelistedRoot } from "../utils/address";

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
   * Get the whitelisted root address for an account.
   * This enables connected accounts to claim on behalf of their main whitelisted account.
   *
   * Failure modes are normalized for predictable behavior:
   * - Throws when no whitelisted root exists (contract returns 0x0)
   * - Throws on network/contract errors
   *
   * @param {string} address Account address to check
   * @returns {Promise<string>} The whitelisted root address
   * @throws {Error} If account is not whitelisted or connected, or if resolution fails
   */
  async getWhitelistedRoot(address: string): Promise<string> {
    try {
      const identity = this.getContract("Identity");
      const root = await identity.getWhitelistedRoot(address);

      // Explicitly handle 0x0 - account is neither whitelisted nor connected
      if (!isValidWhitelistedRoot(root)) {
        throw new Error("No whitelisted root address found; the account may not be whitelisted or connected.");
      }

      return root;
    } catch (error) {
      // Normalize errors for predictable failure modes
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to resolve whitelisted root address: ${message}`);
    }
  }

  /**
   * Check if an address is verified (whitelisted or connected to a whitelisted account).
   * @param address - The address to check
   * @returns true if the address is whitelisted or connected to a whitelisted account
   */
  async isAddressVerified(address: string): Promise<boolean> {
    try {
      const root = await this.getWhitelistedRoot(address);
      return isValidWhitelistedRoot(root);
    } catch {
      return false;
    }
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
      let account = address;

      // Only attempt to get signer address if no address was provided
      // This prevents crashes in read-only contexts when an address is explicitly passed
      if (!account) {
        const signer = this.provider.getSigner();
        account = await signer.getAddress();
      }

      // Get whitelisted root for the address (or signer)
      // This enables connected accounts to check entitlement of their main account
      const whitelistedRoot = await this.getWhitelistedRoot(account);

      // Check entitlement for the root, not the connected address
      return await ubi["checkEntitlement(address)"](whitelistedRoot);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`checkEntitlement failed: ${message}`);
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
