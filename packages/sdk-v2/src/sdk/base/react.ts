import { useContext, useMemo, useState } from "react";
import { Signer, providers, BigNumber } from "ethers";
import { BaseSDK, EnvKey, EnvValue } from "./sdk";
import { TokenContext, Web3Context } from "../../contexts";
import { QueryParams, useCalls, useEthers, CurrencyValue } from "@usedapp/core";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import { useRefreshOrNever } from "../../hooks";
import { G$Balances, G$Tokens, G$Token, G$Amount } from "../constants";
import { GReputation, IGoodDollar } from "@gooddollar/goodprotocol/types";

export const NAME_TO_SDK: { [key: string]: typeof ClaimSDK | typeof SavingsSDK | typeof BaseSDK } = {
  claim: ClaimSDK,
  savings: SavingsSDK,
  base: BaseSDK
};

type RequestedSdk = {
  sdk: ClaimSDK | SavingsSDK | BaseSDK | undefined;
  readOnly: boolean;
};

export type SdkTypes = "claim" | "savings" | "base";

type AmountsMap = {
  [key: string]: BigNumber | undefined;
};

type CurrencyValuesMap<T extends AmountsMap> = {
  [K in keyof T]: CurrencyValue;
};

export const useReadOnlySDK = (type: SdkTypes, requiredChainId?: number): RequestedSdk["sdk"] => {
  return useSDK(true, type, requiredChainId);
};

export const useGetEnvChainId = (requiredChainId?: number) => {
  const { chainId } = useEthers();
  const web3Context = useContext(Web3Context);
  const baseEnv = web3Context.env || "";
  let connectedEnv = baseEnv;

  switch (requiredChainId ?? chainId) {
    case 1:
      connectedEnv = "production-mainnet"; // temp untill dev contracts are released to sepolia
      break;
    case 42220:
      connectedEnv = connectedEnv === "fuse" ? "development-celo" : connectedEnv + "-celo";
      break;
  }

  const defaultEnv = connectedEnv;

  return {
    chainId: Number((Contracts[defaultEnv as keyof typeof Contracts] as EnvValue)?.networkId),
    defaultEnv,
    baseEnv,
    connectedEnv,
    switchNetworkRequest: web3Context.switchNetwork
  };
};

export const useGetContract = (
  contractName: string,
  readOnly = false,
  type: SdkTypes = "base",
  requiredChainId?: number
) => {
  const sdk = useSDK(readOnly, type, requiredChainId);
  const [contract, setContract] = useState(() => sdk?.getContract(contractName));

  // skip first render as contract already initialized by useState()
  useUpdateEffect(() => {
    setContract(sdk?.getContract(contractName));
  }, [contractName, sdk]);

  return contract;
};

export const getSigner = async (signer: void | Signer, account: string) => {
  if (Signer.isSigner(signer)) {
    const address = await signer.getAddress();

    if (address === account) {
      return signer;
    }
  }

  return new Error("no signer or wrong signer");
};

function sdkFactory(
  type: SdkTypes,
  defaultEnv: EnvKey,
  readOnly: boolean,
  library: providers.JsonRpcProvider | providers.FallbackProvider | undefined,
  roLibrary: providers.JsonRpcProvider | undefined
): ClaimSDK | SavingsSDK | undefined {
  let provider = library;
  const reqSdk = NAME_TO_SDK[type];

  if (readOnly && roLibrary) {
    provider = roLibrary;
  }

  if (!provider && readOnly) {
    // the only reason why there is no provider when a read-only one is requested is because there
    // are no read-only urls set for the chain data is requested from
    console.error("No read-only provider could be found", { type });
  }

  if (!provider && !readOnly) {
    console.warn("Need a connected wallet for non-readonly sdk initializations", { type });
    return;
  }

  return new reqSdk(provider as providers.JsonRpcProvider, defaultEnv) as ClaimSDK | SavingsSDK;
}

export const useSDK = (
  readOnly = false,
  type: SdkTypes = "base",
  requiredChainId?: number | undefined
): RequestedSdk["sdk"] => {
  const { library } = useEthers();
  const { chainId, defaultEnv } = useGetEnvChainId(requiredChainId);
  const rolibrary = useReadOnlyProvider(chainId);
  const [sdk, setSdk] = useState<ClaimSDK | SavingsSDK | undefined>(() =>
    sdkFactory(
      type,
      defaultEnv,
      readOnly,
      library instanceof providers.JsonRpcProvider ? library : undefined,
      rolibrary
    )
  );

  // skip first render as sdk already initialized by useState()
  useUpdateEffect(() => {
    setSdk(
      sdkFactory(
        type,
        defaultEnv,
        readOnly,
        library instanceof providers.JsonRpcProvider ? library : undefined,
        rolibrary
      )
    );
  }, [library, rolibrary, readOnly, defaultEnv, type]);

  return sdk;
};

export function useG$Tokens(requiredChainId?: number) {
  const { chainId, defaultEnv } = useGetEnvChainId(requiredChainId);
  const decimals = useContext(TokenContext);

  const tokens = useMemo(
    () => G$Tokens.map(token => G$Token(token, chainId, defaultEnv, decimals)),
    [chainId, defaultEnv, decimals]
  );

  return tokens;
}

export function useG$Amount(value?: BigNumber, token: G$Token = "G$", requiredChainId?: number): CurrencyValue {
  const { chainId, defaultEnv } = useGetEnvChainId(requiredChainId);
  const decimals = useContext(TokenContext);

  return G$Amount(token, value || BigNumber.from("0"), chainId, defaultEnv, decimals);
}

/**
 * Used to convert multiple amounts to currency values
 * you can destructure the return based on your input keys in values
 * @example const { key1, key2 } = useG$Amounts({ key1: BigNumber.from("100"), key2: BigNumber.from("200") })
 * @param values key value pair of amounts to convert
 * @param token which token, currently supports: "G%" / "GOOD"
 * @param requiredChainId
 * @returns
 */
export function useG$Amounts<T extends AmountsMap>(
  values?: T,
  token: G$Token = "G$",
  requiredChainId?: number
): CurrencyValuesMap<T> {
  const { chainId, defaultEnv } = useGetEnvChainId(requiredChainId);
  const decimals = useContext(TokenContext);

  const result: Partial<CurrencyValuesMap<T>> = {};

  for (const key in values) {
    result[key] = G$Amount(token, values[key] || BigNumber.from("0"), chainId, defaultEnv, decimals);
  }

  return result as CurrencyValuesMap<T>;
}

export function useG$Formatted(
  value?: BigNumber,
  token: G$Token = "G$",
  requiredChainId?: number,
  formatOptions?: any
): string {
  const { chainId, defaultEnv } = useGetEnvChainId(requiredChainId);
  const decimals = useContext(TokenContext);

  return G$Amount(token, value || BigNumber.from("0"), chainId, defaultEnv, decimals).format(formatOptions);
}

export function useG$Decimals(token: G$Token = "G$", requiredChainId?: number): number {
  const { chainId } = useGetEnvChainId(requiredChainId);
  const decimals = useContext(TokenContext)[token];

  switch (token) {
    default:
      return decimals[chainId];
  }
}

export function useG$Balance(refresh: QueryParams["refresh"] = "never", requiredChainId?: number) {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();
  const { chainId } = useGetEnvChainId(requiredChainId);

  const g$Contract = useGetContract("GoodDollar", true, "base", chainId) as IGoodDollar;
  const goodContract = useGetContract("GReputation", true, "base", chainId) as GReputation;

  const results = useCalls(
    [
      {
        contract: g$Contract,
        method: "balanceOf",
        args: [account]
      },
      {
        contract: goodContract,
        method: "balanceOf",
        args: [account]
      }
    ],
    {
      refresh: refreshOrNever,
      chainId
    }
  );

  const [g$Value, goodValue] = [...results].map(result => result?.value?.[0] as BigNumber | undefined);

  const g$Balance = useG$Amount(g$Value, "G$", chainId) as CurrencyValue;
  const goodBalance = useG$Amount(goodValue, "GOOD", chainId) as CurrencyValue;

  const balances: G$Balances = {
    G$: g$Balance,
    GOOD: goodBalance
  };

  return balances;
}
