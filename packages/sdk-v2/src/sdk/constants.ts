import { EnvKey } from "./base/sdk";
import { Token } from "@usedapp/core";
import contractsAddresses from "@gooddollar/goodprotocol/releases/deployment.json";

/* List of supported chains for this sdk. */
export enum SupportedChains {
  MAINNET = 1,
  ROPSTEN = 3,
  KOVAN = 42,
  FUSE = 122,
  CELO = 42220
}

export type SUPPORTED_NETWORKS = "FUSE" | "CELO" | "MAINNET" | "KOVAN" | "ROPSTEN";

export enum SupportedV2Networks {
  FUSE = 122,
  CELO = 42220
}

export type SupportedV2Network = keyof typeof SupportedV2Networks

// export const SUPPORTED_NETWORKS: Readonly<string[]> = ["CELO", "FUSE"]

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
  fuse: {
    dappUrl: "https://gooddev.netlify.app",
    identityUrl: "https://goodid-dev.vercel.app",
    backend: "https://good-server.herokuapp.com"
  },
  "development-celo": {
    dappUrl: "https://gooddev.netlify.app",
    identityUrl: "https://goodid-dev.vercel.app",
    backend: "https://good-server.herokuapp.com"
  },
  "staging-celo": {
    dappUrl: "https://goodqa.netlify.app",
    identityUrl: "https://goodid-qa.vercel.app",
    backend: "https://goodserver-qa.herokuapp.com"
  }
};

type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] | number };

export function G$(chainId: number, env: EnvKey): Token {
  const address = G$ContractAddresses("GoodDollar", env) as string;
  return new Token("GoodDollar", "G$", chainId, address, 2);
}

export function GOOD(chainId: number, env: EnvKey): Token {
  const address = G$ContractAddresses("GReputation", env) as string;
  return new Token("GDAO", "GOOD", chainId, address, 18);
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
