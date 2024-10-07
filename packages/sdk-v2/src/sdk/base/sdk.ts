import { Contract, providers, Signer } from "ethers";
import { noop } from "lodash";

//@ts-ignore
import IdentityV2ABI from "@gooddollar/goodprotocol/artifacts/abis/IdentityV2.min.json";
//@ts-ignore
import UBISchemeABI from "@gooddollar/goodprotocol/artifacts/abis/UBIScheme.min.json";
//@ts-ignore
import GoodDollarStakingABI from "@gooddollar/goodprotocol/artifacts/abis/GoodDollarStaking.min.json";
//@ts-ignore
import GoodDollarABI from "@gooddollar/goodprotocol/artifacts/abis/IGoodDollar.min.json";
import FaucetABI from "@gooddollar/goodprotocol/artifacts/abis/Faucet.min.json";
import GReputationABI from "@gooddollar/goodprotocol/artifacts/abis/GReputation.min.json";
import GoodReserveCDaiABI from "@gooddollar/goodprotocol/artifacts/abis/GoodReserveCDai.min.json";

import {
  IdentityV2,
  UBIScheme,
  GoodDollarStaking,
  IGoodDollar,
  Faucet,
  GReputation,
  GoodReserveCDai
} from "@gooddollar/goodprotocol/types";
//@ts-ignore
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";

import { Envs } from "../constants";

export const CONTRACT_TO_ABI: { [key: string]: any } = {
  Identity: IdentityV2ABI,
  UBIScheme: UBISchemeABI,
  GoodDollarStaking: GoodDollarStakingABI,
  GoodDollar: GoodDollarABI,
  Faucet: FaucetABI,
  FuseFaucet: FaucetABI,
  GReputation: GReputationABI,
  GoodReserveCDai: GoodReserveCDaiABI
};

// export type EnvKey = keyof typeof Contracts;
// export type EnvValue = typeof Contracts[EnvKey] & { networkId: number };
// export type ContractKey = keyof EnvValue;
export type EnvKey = string;
export type EnvValue = any;

export class BaseSDK {
  provider: providers.JsonRpcProvider;
  env: (typeof Envs)[EnvKey];
  devEnv: string;
  contracts: EnvValue;
  signer: Signer | void = undefined;
  constructor(provider: providers.JsonRpcProvider, contractsEnv: EnvKey = "production") {
    this.provider = provider;
    const devEnv = contractsEnv.split("-")[0];
    this.devEnv = devEnv === "fuse" ? "development" : devEnv;
    this.env = Envs[devEnv];
    this.contracts = Contracts[contractsEnv as keyof typeof Contracts] as EnvValue;

    provider
      .getNetwork()
      .then(network => {
        if (network.chainId != this.contracts.networkId)
          console.error(
            `BaseSDK: provider chainId doesn't match env (${contractsEnv as string}) chainId. provider:${
              network.chainId
            } env:${this.contracts.networkId}`
          );
      })
      .catch(noop);

    const signer = provider.getSigner();

    signer
      .getAddress()
      .then(async () => void (this.signer = signer))
      .catch(noop);
  }

  getContract(contractName: "UBIScheme"): UBIScheme;
  getContract(contractName: "Identity"): IdentityV2;
  getContract(contractName: "GoodDollarStaking"): GoodDollarStaking;
  getContract(contractName: "GoodDollar"): IGoodDollar;
  getContract(contractName: "Faucet"): Faucet;
  getContract(contractName: "GReputation"): GReputation;
  getContract(contractName: "GoodReserveCDai"): GoodReserveCDai;
  getContract(contractName: string): Contract;
  getContract(contractName: string) {
    if (!this.contracts[contractName]) return;

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
        ) as IdentityV2;
      case "GoodDollarStaking":
        return new Contract(
          this.contracts["GoodDollarStaking"],
          CONTRACT_TO_ABI["GoodDollarStaking"].abi,
          this.signer || this.provider
        ) as any;
      case "GoodDollar":
        return new Contract(
          this.contracts["GoodDollar"],
          CONTRACT_TO_ABI["GoodDollar"].abi,
          this.signer || this.provider
        ) as any;
      case "Faucet":
        return new Contract(
          this.contracts["Faucet"],
          CONTRACT_TO_ABI["Faucet"].abi,
          this.signer || this.provider
        ) as any;
      case "GReputation":
        return new Contract(
          this.contracts["GReputation"],
          CONTRACT_TO_ABI["GReputation"].abi,
          this.signer || this.provider
        ) as any;
      case "GoodReserveCDai":
        return new Contract(
          this.contracts["GoodReserveCDai"],
          CONTRACT_TO_ABI["GoodReserveCDai"].abi,
          this.signer || this.provider
        ) as any;
      default:
        return new Contract(
          this.contracts[contractName],
          CONTRACT_TO_ABI[contractName].abi,
          this.signer || this.provider
        );
    }
  }
}
