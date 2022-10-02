import React, { useMemo, useContext } from "react";
import { Signer } from "ethers";
import { EnvKey, EnvValue } from "./sdk";
import { Web3Context } from "../../contexts";
import { useEthers } from "@usedapp/core";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";

export const NAME_TO_SDK: { [key: string]: typeof ClaimSDK | typeof SavingsSDK } = {
  claim: ClaimSDK,
  savings: SavingsSDK
};

type RequestedSdk = {
  sdk: ClaimSDK | SavingsSDK | undefined;
  readOnly: boolean;
};

export type SdkTypes = "claim" | "savings";

export const useReadOnlySDK = (type: SdkTypes, env?: EnvKey): RequestedSdk["sdk"] => {
  return useSDK(true, type, env);
};

export const useGetEnvChainId = (env?: EnvKey) => {
  const { chainId } = useEthers();
  const web3Context = useContext(Web3Context);
  let connectedEnv = web3Context.env || "";

  switch (chainId) {
    case 1:
    case 3:
    case 42:
      connectedEnv += "-mainnet";
      break;
    case 42220:
      connectedEnv = connectedEnv === "fuse" ? "development-celo" : connectedEnv + "-celo";
      break;
  }

  const defaultEnv = env || connectedEnv;
  return {
    chainId: Number((Contracts[defaultEnv as keyof typeof Contracts] as EnvValue).networkId),
    defaultEnv,
    connectedEnv,
    switchNetworkRequest: web3Context.switchNetwork
  };
};

export const useGetContract = (contractName: string, readOnly: boolean = false, type?: SdkTypes, env?: EnvKey) => {
  const sdk = useSDK(readOnly, type, env);
  return useMemo(() => sdk?.getContract(contractName), [contractName, , sdk]);
};

export const getSigner = async (signer: void | Signer, account: string) => {
  const isSigner = Signer.isSigner(signer) && (await signer.getAddress()) === account && signer;
  if (!isSigner) return new Error("no signer or wrong signer");
  return signer;
};

export const useSDK = (readOnly: boolean = false, type: string = "base", env?: EnvKey): RequestedSdk["sdk"] => {
  const { library } = useEthers();
  const { chainId, defaultEnv } = useGetEnvChainId(readOnly ? env : undefined); //when not readonly we ignore env and get the env user is connected to
  const rolibrary = useReadOnlyProvider(chainId) ?? library;

  console.log("useSDK", { type, readOnly, env, chainId, defaultEnv, rolibrary: !!rolibrary });
  const sdk = useMemo<ClaimSDK | SavingsSDK | undefined>(() => {
    const reqSdk = NAME_TO_SDK[type];
    if (readOnly && rolibrary) {
      return new reqSdk(rolibrary, defaultEnv);
    } else if (!readOnly && library) {
      return new reqSdk(library, defaultEnv);
    } else {
      console.error("Error detecting readonly urls from config");
    }
  }, [library, rolibrary, readOnly, defaultEnv, type]);
  return sdk;
};
