import { useCallback, useContext, useMemo } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { useCall, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { QueryParams } from "@usedapp/core";
import { first } from "lodash";
import usePromise from "react-use-promise";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { Web3Context } from "../../contexts/Web3Context";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";
import { ClaimSDK, CONTRACT_TO_ABI, EnvKey, EnvValue } from "./sdk";
import { IIdentity } from "@gooddollar/goodprotocol/types";

type Ethers = typeof ethers;

type ReadOnlyClaimSDK = ClaimSDK;

export const useSDK = (readOnly: boolean = false, env?: EnvKey) => {
  const { library } = useEthers();
  const { chainId, defaultEnv } = useGetEnvChainId(env);
  const rolibrary = useReadOnlyProvider(chainId) || library;

  const sdk = useMemo(() => {
    if (readOnly && rolibrary) {
      return new ClaimSDK(rolibrary, defaultEnv);
    } else if (library) {
      return new ClaimSDK(library, defaultEnv);
    }
    //else {return new ClaimSDK(new ethers.providers.CloudflareProvider(), defaultEnv);
  }, [library, rolibrary, defaultEnv, readOnly, chainId]);

  return sdk;
};

export const useReadOnlySDK = (env?: EnvKey): ReadOnlyClaimSDK | undefined => {
  return useSDK(true, env);
};

export const useGetEnvChainId = (env?: EnvKey) => {
  const web3Context = useContext(Web3Context);
  const defaultEnv = env || web3Context.env;

  return {
    chainId: (Contracts[defaultEnv as keyof typeof Contracts] as EnvValue).networkId,
    defaultEnv,
    switchNetworkRequest: web3Context.switchNetwork
  };
};
export const useGetContract = (contractName: string, readOnly: boolean = false, env?: EnvKey) => {
  const sdk = useSDK(readOnly, env);
  return useMemo(() => sdk?.getContract(contractName), [contractName, , sdk]);
};

export const useFVLink = () => {
  const sdk = useSDK();
  return useMemo(() => sdk?.getFVLink(), [sdk]);
};

export const useIsAddressVerified = (address: string, env?: EnvKey) => {
  const sdk = useReadOnlySDK(env);

  const result = usePromise(() => {
    if (address && sdk) return sdk.isAddressVerified(address);
    return Promise.resolve(undefined);
  }, [address, env, sdk]);
  return result;
};

export const useClaim = (refresh: QueryParams["refresh"] = "never") => {
  const DAY = 1000 * 60 * 60 * 24;
  const { account } = useEthers();

  const ubi = useGetContract("UBIScheme") as UBIScheme;
  const identity = useGetContract("Identity", true) as IIdentity;
  const claimCall = useContractFunction(ubi, "claim");

  // const [entitlement] = usePromise(ubi["checkEntitlement()"]());
  const results = useCalls(
    [
      {
        contract: identity,
        method: "isWhitelisted",
        args: [account]
      },
      {
        contract: ubi,
        method: "currentDay",
        args: []
      },
      {
        contract: ubi,
        method: "periodStart",
        args: []
      },
      {
        contract: ubi,
        method: "checkEntitlement(address)",
        args: [account]
      } //this reverts in some cases, bug in contract
    ],
    { refresh }
  );

  const periodStart = (first(results[2]?.value) || BigNumber.from("0")) as BigNumber;
  const currentDay = (first(results[1]?.value) || BigNumber.from("0")) as BigNumber;
  let startRef = new Date(periodStart.toNumber() * 1000 + currentDay.toNumber() * DAY);
  if (startRef < new Date()) {
    startRef = new Date(periodStart.toNumber() * 1000 + (currentDay.toNumber() + 1) * DAY);
  }

  // console.log("useClaim:", {
  //   results,
  //   account,
  //   isWhitelisted: first(results[0]?.value) as boolean,
  //   claimAmount: (first(results[3]?.value) as BigNumber) || BigNumber.from("0"),
  //   claimTime: startRef,
  //   claimCall,
  //   ubi,
  //   identity
  // });
  return {
    isWhitelisted: first(results[0]?.value) as boolean,
    claimAmount: (first(results[3]?.value) as BigNumber) || BigNumber.from("0"),
    claimTime: startRef,
    claimCall
  };
};
