import { EnvKey } from "./base/sdk";
import { Currency, CurrencyValue, Token } from "@usedapp/core";
import contractsAddresses from "@gooddollar/goodprotocol/releases/deployment.json";
import { BigNumber } from "ethers";

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
  G$: CurrencyValue;
  GOOD: CurrencyValue;
}

export type G$Token = keyof G$Balances;

export type G$DecimalsByChain = Partial<Record<SupportedChains, number>>;

export type G$DecimalsMap = {
  G$: G$DecimalsByChain;
  GOOD: G$DecimalsByChain;
};

// will be used as default (fallback) values
export const G$Decimals: G$DecimalsMap = {
  G$: {
    [SupportedChains.MAINNET]: 2,
    [SupportedChains.FUSE]: 2,
    [SupportedChains.CELO]: 18
  },
  GOOD: {
    [SupportedChains.MAINNET]: 18,
    [SupportedChains.FUSE]: 18,
    [SupportedChains.CELO]: 18
  }
};

export const G$Tokens = Object.keys(G$Decimals) as G$Token[];

export type SupportedV2Network = keyof typeof SupportedV2Networks;

export const Envs: { [key: EnvKey]: { [key: string]: string } } = {
  production: {
    dappUrl: "https://wallet.gooddollar.org",
    identityUrl: "https://goodid.gooddollar.org",
    backend: "https://goodserver.gooddollar.org",
    goodCollectiveUrl: "https://goodcollective.vercel.app/"
  },
  staging: {
    dappUrl: "https://qa.gooddollar.org",
    identityUrl: "https://goodid-qa.vercel.app",
    backend: "https://goodserver-qa.herokuapp.com",
    // goodCollectiveUrl: "https://staging-goodcollective.vercel.app/"
    goodCollectiveUrl: "https://dev-goodcollective.vercel.app/"
  },
  development: {
    dappUrl: "https://dev.gooddollar.org",
    identityUrl: "https://goodid-dev.vercel.app",
    backend: "https://good-server.herokuapp.com",
    goodCollectiveUrl: "https://dev-goodcollective.vercel.app/"
  }
};

type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] | number };

export const G$TokenContracts = {
  G$: {
    contract: "GoodDollar",
    name: "GoodDollar",
    ticker: "G$"
  },
  GOOD: {
    contract: "GReputation",
    name: "GOOD",
    ticker: "GOOD"
  }
};

const CURRENCIES_CASH = {};
export function G$Token(
  tokenName: G$Token,
  chainId: number,
  env: string,
  decimalsMap: G$DecimalsMap = G$Decimals
): Token {
  const { contract, name, ticker } = G$TokenContracts[tokenName];

  const tokenEnv: string = env;
  const tokenChain: number = chainId;

  switch (tokenName) {
    default:
      break;
  }

  const decimals = decimalsMap[tokenName][chainId];
  const address = G$ContractAddresses(contract, tokenEnv) as string;
  const key = tokenName + "_" + chainId + "_" + decimals;

  CURRENCIES_CASH[key] =
    CURRENCIES_CASH[key] ||
    new Token(name, ticker, tokenChain, address, decimals, {
      significantDigits: decimals,
      useFixedPrecision: true,
      fixedPrecisionDigits: 2
    });
  return CURRENCIES_CASH[key];
}

export function G$Amount(
  tokenName: G$Token,
  value: BigNumber,
  chainId: number,
  env: string,
  decimalsMap: G$DecimalsMap = G$Decimals
) {
  const token = G$Token(tokenName, chainId, env, decimalsMap);

  return new CurrencyValue(token, value);
}

// display amount with X decimals
export function formatAmount(
  value: BigNumber,
  tokenDecimals: number,
  displayDecimals = 2,
  currencyFormatOptions?: any,
  tokenName = "GoodDollar",
  tokenSymbol = "G$"
) {
  const c = new Currency(tokenName, tokenSymbol, tokenDecimals, {
    useFixedPrecision: true,
    fixedPrecisionDigits: displayDecimals,
    thousandSeparator: "",
    ...currencyFormatOptions
  });
  return new CurrencyValue(c, value).format();
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

export const FV_LOGIN_MSG = `Sign this message to login into GoodDollar Unique Identity service.
WARNING: do not sign this message unless you trust the website/application requesting this signature.
nonce:`;

export const FV_IDENTIFIER_MSG2 = `Sign this message to request verifying your account <account> and to create your own secret unique identifier for your anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`;

/**
 * Submits a referral attribution event to the divvi tracking API
 * @param params.txHash - The transaction hash
 * @param params.chainId - The chain ID
 * @param params.baseUrl - The base URL for the API endpoint (optional, defaults to 'https://api.divvi.xyz/submitReferral')
 * @returns A promise that resolves to the data from the API
 * @throws {Error} Throws an error if the request fails due to client-side or server-side issues
 */
export const submitReferral = async ({
  txHash,
  chainId,
  baseUrl = "https://api.divvi.xyz/submitReferral"
}): Promise<any> => {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ txHash, chainId })
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || "Unknown error while submitting referral");
  }

  return response.json();
};
