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

export type SUPPORTED_NETWORKS = 'FUSE' | 'CELO' | 'MAINNET' | 'KOVAN' | 'ROPSTEN'

// export const SUPPORTED_NETWORKS: Readonly<string[]> = ["CELO", "FUSE"]

export const Envs: { [key: EnvKey]: { [key: string]: string } } = {
  production: {
    dappUrl: "https://wallet.gooddollar.org",
    identityUrl: "https://goodid.gooddollar.org"
  },
  staging: {
    dappUrl: "https://goodqa.netlify.app",
    identityUrl: "https://goodidqa.netlify.app"
  },
  fuse: {
    dappUrl: "https://gooddev.netlify.app",
    identityUrl: "https://fv-standalone--gooddev.netlify.app"
  }
};

type ObjectLike = { [key: string]: string | ObjectLike | Array<string[]> | string[] };

export function G$(chainId:number, env: EnvKey):Token {
  const address = G$ContractAddresses(chainId, 'GoodDollar', env) as string
  return new Token('GoodDollar', 'G$', chainId, address, 2)
}

export function GOOD(chainId:number, env: EnvKey):Token {
  const address = G$ContractAddresses(chainId, 'GReputation', env) as string
  return new Token('GDAO', 'GOOD', chainId, address, 18)
}

export function G$ContractAddresses<T = ObjectLike>(chainId: SupportedChains, name: string, env: EnvKey): T {
  let deploymentName = env;

  switch (chainId) {
    case SupportedChains.KOVAN:
      deploymentName = "kovan-mainnet";
      break;
    case SupportedChains.MAINNET:
    case SupportedChains.ROPSTEN:
      deploymentName = env + "-mainnet";
      break;
    case SupportedChains.FUSE:
      deploymentName = env;
      break;
    case SupportedChains.CELO:
      deploymentName = ( env === 'fuse' ? 'development' : env ) + '-celo';
      break;
  }

  if (!contractsAddresses[deploymentName]) {
    console.warn(`tokens: Unsupported chain ID ${deploymentName}`, env);
    deploymentName = deploymentName.includes("mainnet") ? env + "-mainnet" : env;
  }
  if (!contractsAddresses[deploymentName][name]) {
    throw new Error(`Inappropriate contract name ${name} in ${deploymentName} ${chainId}`);
  }

  return contractsAddresses[deploymentName][name] as unknown as T;
}