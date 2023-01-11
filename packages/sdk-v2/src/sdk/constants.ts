import { EnvKey } from "./base/sdk";
import { CurrencyValue, Token } from "@usedapp/core";
import contractsAddresses from "@gooddollar/goodprotocol/releases/deployment.json";

/* List of supported chains for this sdk. */
export enum SupportedChains {
  MAINNET = 1,
  FUSE = 122,
  CELO = 42220
}

export type SUPPORTED_NETWORKS = "FUSE" | "CELO" | "MAINNET";

export enum SupportedV2Networks {
  FUSE = 122,
  CELO = 42220
}

export interface G$Balances {
  G$: CurrencyValue | undefined,
  GOOD: CurrencyValue | undefined,
  GDX: CurrencyValue | undefined,
};

export type G$DecimalsMap = {
  G$: number,
  GOOD: number,
  GDX: number
}

// will be used as default (fallback) values
export const G$Decimals = {
  G$: 18, // 18 because default chain will be Celo
  GOOD: 18,
  GDX: 2
}

export type SupportedV2Network = keyof typeof SupportedV2Networks;

export const Envs: { [key: EnvKey]: { [key: string]: string } } = {
  production: {
    dappUrl: "https://wallet.gooddollar.org",
    identityUrl: "https://goodid.gooddollar.org",
    backend: "https://goodserver.gooddollar.org"
  },
  staging: {
    dappUrl: "https://goodqa.netlify.app",
    identityUrl: "https://goodid-qa.vercel.app",
    backend: "https://goodserver-qa.herokuapp.com"
  },
  development: {
    dappUrl: "https://gooddev.netlify.app",
    identityUrl: "https://goodid-dev.vercel.app",
    backend: "https://good-server.herokuapp.com"
  }
};

type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] | number };

export const G$TokenContracts = {
  G$: {
    contract: "GoodDollar",
    name: "GoodDollar",
    symbol: "G$",
    decimals: G$Decimals.G$
  },
  GOOD: {
    contract: "GReputation",
    name: "GDAO",
    symbol: "GOOD",
    decimals: G$Decimals.GOOD,
  },
  GDX: {
    contract: "GoodReserveCDai",
    name: "GoodDollar X",
    symbol: "GDX",
    decimals: G$Decimals.GDX
  }
}

export function GdTokens(tokenName: string, chainId: number, env: string, tokenDecimals?: any) {
  const { contract, name, symbol, decimals: defaultDecimals } = G$TokenContracts[tokenName]
  
  let tokenEnv: string, tokenChain: number;
  switch (tokenName) {
    case 'GDX':
      tokenEnv = "production-mainnet"; // only hardcoded because of missing dev contracts (deprecated ropsten/kovan)
      tokenChain = SupportedChains.MAINNET;
      break;
    default:
      tokenEnv = env;
      tokenChain = chainId;
      break;
  }

  const decimals = tokenDecimals ?? defaultDecimals
  const address = G$ContractAddresses(contract, tokenEnv) as string

  return new Token(name, symbol, tokenChain, address, decimals)
}

export function G$ContractAddresses<T = ObjectLike>(name: string, env: EnvKey): T {
  if (!(contractsAddresses as any)[env]) {
    console.warn(`tokens: Unsupported chain ID ${env}`, env);
    env = env.includes("mainnet") ? env + "-mainnet" : env;
  }

  if (!(contractsAddresses as any)[env][name]) {
    throw new Error(`Inappropriate contract name ${name} in ${env}`);
  }

  return (contractsAddresses as any)[env][name] as unknown as T;
}
