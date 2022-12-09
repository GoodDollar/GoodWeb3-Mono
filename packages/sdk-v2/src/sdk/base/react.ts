import { useContext, useState } from "react";
import { Signer, providers } from "ethers";
import { BaseSDK, EnvKey, EnvValue } from "./sdk";
import { Web3Context } from "../../contexts";
import { QueryParams, useCalls, useEthers, CurrencyValue, Currency, Token, ChainId } from "@usedapp/core";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import { useRefreshOrNever } from "../../hooks";
import { SupportedChains, G$ContractAddresses, G$Balances } from "../constants";
import { GoodReserveCDai, GReputation, IGoodDollar } from "@gooddollar/goodprotocol/types";

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
      connectedEnv = "production-mainnet"; // temp untill dev contracts are released to goerli
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

  if (!provider) {
    console.error("Error detecting readonly urls from config");
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

/* Not sure about placement of this hook, use base for now */

export function useG$Tokens() {
  const { chainId, defaultEnv, baseEnv } = useGetEnvChainId();
  const g$ = G$ContractAddresses("GoodDollar", defaultEnv) as string;
  const good = G$ContractAddresses("GReputation", defaultEnv) as string;
  const gdx = G$ContractAddresses("GoodReserveCDai", baseEnv + "-mainnet") as string;

  return {
    g$: new Token("GoodDollar", "G$", chainId, g$, 2),
    good: new Token("GDAO", "GOOD", chainId, good, 18),
    gdx: new Token("GoodDollar X", "G$X", SupportedChains.MAINNET, gdx, 2)
  };
}

export function useG$Balance(refresh: QueryParams["refresh"] = "never") {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();

  const { chainId } = useGetEnvChainId();
  const { g$, good, gdx } = useG$Tokens();

  const g$Contract = useGetContract("GoodDollar", true, "base") as IGoodDollar;
  const goodContract = useGetContract("GReputation", true, "base") as GReputation;
  const gdxContract = useGetContract("GoodReserveCDai", true, "base", 1) as GoodReserveCDai;

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

  const [mainnetGdx] = useCalls(
    [
      {
        contract: gdxContract,
        method: "balanceOf",
        args: [account]
      }
    ].filter(_ => _.contract && chainId == SupportedChains.MAINNET),
    { refresh: refreshOrNever, chainId: SupportedChains.MAINNET as unknown as ChainId }
  );

  const balances: G$Balances = {
    G$: undefined,
    GOOD: undefined,
    GDX: undefined
  };

  if (!results.includes(undefined) && !results[0]?.error) {
    const g$Balance = {
      amount: CurrencyValue.fromString(g$, results[0]?.value[0].toString()),
      token: new Currency("GoodDollar", "G$", 2)
    };

    const goodBalance = {
      amount: CurrencyValue.fromString(good, results[1]?.value[0].toString()),
      token: new Currency("GDAO", "GOOD", 18)
    };
    balances.G$ = g$Balance;
    balances.GOOD = goodBalance;
  }

  if (mainnetGdx) {
    const gdxBalance = {
      amount: CurrencyValue.fromString(gdx, mainnetGdx.value[0].toString()),
      token: new Currency("G$X", "GDX", 2)
    };

    balances.GDX = gdxBalance;
  }

  return balances;
}
