import { EnvKey } from "./base/sdk";
import { Currency, CurrencyValue, Token } from "@usedapp/core";
import contractsAddresses from "@gooddollar/goodprotocol/releases/deployment.json";
import { BigNumberish } from "ethers";

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

export type G$Tokens = {
  amount: CurrencyValue;
  token: Currency;
};

export type G$DecimalsMap = Partial<Record<SupportedChains, number>>;

// will be used as default (fallback) values
export const G$Decimals: { G$: G$DecimalsMap, GOOD: G$DecimalsMap, GDX: G$DecimalsMap } = {
  G$: {
    [SupportedChains.MAINNET]: 2,
    [SupportedChains.FUSE]: 2,
    [SupportedChains.CELO]: 18,
  },
  GOOD: {
    [SupportedChains.MAINNET]: 18,
    [SupportedChains.FUSE]: 18,
    [SupportedChains.CELO]: 18,
  },
  GDX: {
    [SupportedChains.MAINNET]: 2,
  }
};

export interface G$Balances {
  G$: G$Tokens | undefined;
  GOOD: G$Tokens | undefined;
  GDX: G$Tokens | undefined;
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

export function G$(chainId: number, env?: string, decimalsMap: G$DecimalsMap = G$Decimals.G$): Token {
  const address = G$ContractAddresses("GoodDollar", env ?? "") as string;

  return new Token("GoodDollar", "G$", chainId, address, decimalsMap[chainId]);
}

export function GOOD(chainId: number, env?: string, decimalsMap: G$DecimalsMap = G$Decimals.GOOD): Token {
  const address = G$ContractAddresses("GReputation", env ?? "") as string;

  return new Token("GDAO", "GOOD", chainId, address, decimalsMap[chainId]);
}

export function GDX(baseEnv?: string, decimalsMap: G$DecimalsMap = G$Decimals.GDX): Token {
  const address = G$ContractAddresses("GoodReserveCDai", baseEnv + "-mainnet") as string;
  const chainId = SupportedChains.MAINNET;

  return new Token("GoodDollar X", "G$X", chainId, address, decimalsMap[chainId]);
}

export function G$Amount(g$: Token, chainId: number, value?: BigNumberish, decimalsMap: G$DecimalsMap = G$Decimals.G$): G$Tokens | null {
  return !value ? null : {
    amount: CurrencyValue.fromString(g$, value.toString()),
    token: new Currency("GoodDollar", "G$", decimalsMap[chainId]),
  }
}

export function GOODAmount(good: Token, chainId: number, value?: BigNumberish, decimalsMap: G$DecimalsMap = G$Decimals.GOOD): G$Tokens | null {
  return !value ? null : {
    amount: CurrencyValue.fromString(good, value.toString()),
    token: new Currency("GDAO", "GOOD", decimalsMap[chainId]),
  }
}

export function GDXAmount(gdx: Token, value?: BigNumberish, decimalsMap: G$DecimalsMap = G$Decimals.GDX): G$Tokens | null {
  const decimals = decimalsMap[SupportedChains.MAINNET];

  return !value || !decimals ? null : {
    amount: CurrencyValue.fromString(gdx, value.toString()),
    token: new Currency("G$X", "GDX", decimals),
  }
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
