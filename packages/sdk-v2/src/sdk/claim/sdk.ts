import { BigNumber, Contract, ethers } from "ethers";
import { providers, Signer } from "ethers";
import { Envs } from "../constants";
//@ts-ignore
import IdentityABI from "@gooddollar/goodprotocol/artifacts/abis/IIdentity.min.json";
//@ts-ignore
import UBISchemeABI from "@gooddollar/goodprotocol/artifacts/abis/UBIScheme.min.json";
import { IIdentity, UBIScheme } from "@gooddollar/goodprotocol/types";
//@ts-ignore
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
type Ethers = typeof ethers;

const FV_LOGIN_MSG = `Sign this message to login into GoodDollar Unique Identity service.
WARNING: do not sign this message unless you trust the website/application requesting this signature.
nonce:`;

const FV_IDENTIFIER_MSG = `Sign this message to create your own unique identifier for you anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`;

export const CONTRACT_TO_ABI: { [key: string]: any } = {
  Identity: IdentityABI,
  UBIScheme: UBISchemeABI
};

// export type EnvKey = keyof typeof Contracts;
// export type EnvValue = typeof Contracts[EnvKey] & { networkId: number };
// export type ContractKey = keyof EnvValue;
export type EnvKey = string;
export type EnvValue = any;

export class ClaimSDK {
  provider: providers.JsonRpcProvider;
  env: typeof Envs[EnvKey];
  contracts: EnvValue;
  signer: Signer | void = undefined;
  constructor(provider: providers.JsonRpcProvider, envKey: EnvKey = "production") {
    this.provider = provider;
    this.env = Envs[envKey];
    this.contracts = Contracts[envKey as keyof typeof Contracts] as EnvValue;
    provider.getNetwork().then(network => {
      if (network.chainId != this.contracts.networkId)
        // throw new Error(
        console.warn(
          `ClaimSDK: provider chainId doesn't much env (${envKey as string}) chainId. provider:${network.chainId} env:${
            this.contracts.networkId
          }`
        );
      // );
    });
    try {
      const signer = provider.getSigner();
      provider
        .listAccounts()
        .then(async accts => {
          if (accts.length > 0) {
            this.signer = await provider.getSigner();
          }
        })
        .catch((e: any) => {
          console.warn("ClaimSDK: provider has no signer", { signer, provider, error: e.message });
        });
    } catch (e: any) {
      console.warn("ClaimSDK: provider has no signer", { provider, error: e.message });
    }
  }

  getContract(contractName: "UBIScheme"): UBIScheme;
  getContract(contractName: "Identity"): IIdentity;
  getContract(contractName: string): Contract;
  getContract(contractName: string) {
    switch (contractName) {
      case "UBIScheme":
        return new Contract(
          this.contracts["UBIScheme"],
          CONTRACT_TO_ABI["UBIScheme"].abi,
          this.signer || this.provider
        ) as UBIScheme;
      case "Identity":
        return new Contract(
          this.contracts["Identity"],
          CONTRACT_TO_ABI["Identity"].abi,
          this.signer || this.provider
        ) as IIdentity;
      default:
        return new Contract(
          this.contracts[contractName],
          CONTRACT_TO_ABI[contractName].abi,
          this.signer || this.provider
        );
    }
  }
  async generateFVLink(firstName: string, callbackUrl?: string, popupMode: boolean = false) {
    const steps = this.getFVLink();
    await steps.getLoginSig();
    await steps.getFvSig();
    return steps.getLink(firstName, callbackUrl, popupMode);
  }

  getFVLink() {
    let loginSig: string, fvSig: string, nonce: string;
    const getLoginSig = async () => {
      nonce = (Date.now() / 1000).toFixed(0);
      return (loginSig = await this.provider.getSigner().signMessage(FV_LOGIN_MSG + nonce));
    };
    const getFvSig = async () => {
      return (fvSig = await this.provider.getSigner().signMessage(FV_IDENTIFIER_MSG));
    };
    const getLink = (firstName: string, callbackUrl?: string, popupMode: boolean = false) => {
      if (!fvSig || !loginSig) throw new Error("missing login or identifier signature");
      const params = new URLSearchParams();
      params.append("nonce", nonce);
      params.append("firstname", firstName);
      params.append("sig", loginSig);
      params.append("fvsig", fvSig);
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
