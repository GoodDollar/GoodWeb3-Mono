/* List of supported chains for this application. */
export enum SupportedChainId {
  MAINNET = 1,
  FUSE = 122,
  CELO = 42220
}

export enum DAO_NETWORK {
  MAINNET = "mainnet",
  FUSE = "fuse",
  CELO = "celo"
}

export enum ChainIdHexes {
  MAINNET = "0x1",
  FUSE = "0x7a",
  CELO = "0xa4ec"
}

/* List of supported chain's names. */
export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
  [SupportedChainId.MAINNET]: "mainnet",
  [SupportedChainId.FUSE]: "fuse",
  [SupportedChainId.CELO]: "celo"
};

export const ONBOARD_CHAINID: { [chainId in ChainIdHexes | string]: number } = {
  [ChainIdHexes.MAINNET]: 1,
  [ChainIdHexes.FUSE]: 122,
  [ChainIdHexes.CELO]: 42220
};

export const ONBOARD_DEFAULT_TOKEN: { [chainId in SupportedChainId | number]: string } = {
  [SupportedChainId.MAINNET]: "ETH",
  [SupportedChainId.FUSE]: "FUSE",
  [SupportedChainId.CELO]: "CELO"
};

export const stakesSupportedAt: Array<number | undefined> = [SupportedChainId.MAINNET];
// export const portfolioSupportedAt: Array<number | undefined> = [SupportedChainId.KOVAN]
