import { Currency, NativeCurrency, Token, WETH9 } from "@uniswap/sdk-core";
import { G$ContractAddresses, UNI_ADDRESS } from "./addresses";
import { SupportedChainId } from "./chains";
import invariant from "tiny-invariant";

export const AMPL = new Token(
  SupportedChainId.MAINNET,
  "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
  9,
  "AMPL",
  "Ampleforth"
);

export const USDT = new Token(
  SupportedChainId.MAINNET,
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  6,
  "USDT",
  "Tether USD"
);
export const FEI = new Token(
  SupportedChainId.MAINNET,
  "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  18,
  "FEI",
  "Fei USD"
);
export const TRIBE = new Token(
  SupportedChainId.MAINNET,
  "0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B",
  18,
  "TRIBE",
  "Tribe"
);
export const FRAX = new Token(
  SupportedChainId.MAINNET,
  "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  18,
  "FRAX",
  "Frax"
);
export const FXS = new Token(
  SupportedChainId.MAINNET,
  "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
  18,
  "FXS",
  "Frax Share"
);
export const renBTC = new Token(
  SupportedChainId.MAINNET,
  "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
  8,
  "renBTC",
  "renBTC"
);
export const UMA = new Token(
  SupportedChainId.MAINNET,
  "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
  18,
  "UMA",
  "UMA Voting Token v1"
);
export const ETH2X_FLI = new Token(
  SupportedChainId.MAINNET,
  "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD",
  18,
  "ETH2x-FLI",
  "ETH 2x Flexible Leverage Index"
);

/* Mirror Protocol compat. */
export const UST = new Token(
  SupportedChainId.MAINNET,
  "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
  18,
  "UST",
  "Wrapped UST"
);
export const MIR = new Token(
  SupportedChainId.MAINNET,
  "0x09a3ecafa817268f77be1283176b946c4ff2e608",
  18,
  "MIR",
  "Wrapped MIR"
);

export const FUSE = new (class extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    const weth9 = WETH9_EXTENDED[this.chainId];
    !weth9 ? invariant(false, "WRAPPED") : void 0;
    return weth9;
  }

  constructor(chainId: number, decimals: number, symbol?: string, name?: string) {
    super(chainId, decimals, symbol, name);
  }
})(SupportedChainId.FUSE, 18, "FUSE", "Fuse") as NativeCurrency;

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
  [SupportedChainId.FUSE]: new Token(
    SupportedChainId.FUSE,
    "0x0BE9e53fd7EDaC9F859882AfdDa116645287C629",
    18,
    "WETH9",
    "Wrapped Fuse"
  )
};

export const USDC: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    6,
    "USDC",
    "USD//C"
  ),
  [SupportedChainId.FUSE]: new Token(
    SupportedChainId.FUSE,
    "0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5",
    6,
    "USDC",
    "USD//C"
  )
};

export const UNI: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(SupportedChainId.MAINNET, UNI_ADDRESS[1], 18, "UNI", "Uniswap"),
  [SupportedChainId.FUSE]: new Token(
    SupportedChainId.FUSE,
    "0xFcF3Bd3AEa648558B4f71499762558326E8F1077",
    18,
    "UNI",
    "Uniswap"
  )
};

export const G$: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    G$ContractAddresses(SupportedChainId.MAINNET, "GoodDollar"),
    2,
    "G$",
    "GoodDollar"
  ),
  [SupportedChainId.FUSE]: new Token(
    SupportedChainId.FUSE,
    G$ContractAddresses(SupportedChainId.FUSE, "GoodDollar"),
    2,
    "G$",
    "GoodDollar"
  ),
  [SupportedChainId.CELO]: new Token(
    SupportedChainId.CELO,
    G$ContractAddresses(SupportedChainId.CELO, "GoodDollar"),
    18,
    "G$",
    "GoodDollar"
  )
};

export const GDAO: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    G$ContractAddresses(SupportedChainId.MAINNET, "GReputation"),
    18,
    "GOOD",
    "GoodDollar Reputation"
  ),
  [SupportedChainId.FUSE]: new Token(
    SupportedChainId.FUSE,
    G$ContractAddresses(SupportedChainId.FUSE, "GReputation"),
    18,
    "GOOD",
    "GoodDollar Reputation"
  )
};

export const DAI: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    G$ContractAddresses(SupportedChainId.MAINNET, "DAI"),
    18,
    "DAI",
    "Dai Stablecoin"
  )
  // [SupportedChainId.FUSE]: new Token(SupportedChainId.FUSE, G$ContractAddresses(SupportedChainId.FUSE, 'DAI'), 18, 'DAI', 'Dai Stablecoin'),
};

export const CDAI: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    G$ContractAddresses(SupportedChainId.MAINNET, "cDAI"),
    8,
    "cDAI",
    "Compound DAI"
  )
  // [SupportedChainId.FUSE]: new Token(SupportedChainId.FUSE, G$ContractAddresses(SupportedChainId.FUSE, 'cDAI'), 8, 'cDAI', 'Compound DAI'),
};

export const WBTC: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: new Token(
    SupportedChainId.MAINNET,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    8,
    "WBTC",
    "Wrapped BTC"
  )
  // [SupportedChainId.FUSE]: new Token(SupportedChainId.FUSE, G$ContractAddresses(SupportedChainId.FUSE, 'WBTC'), 8, 'WBTC', 'Wrapped BTC'),
};

export const TOKEN_LISTS: { [chainId: number]: string[] } = {
  [SupportedChainId.MAINNET]: [
    "https://ipfs.io/ipns/tokens.uniswap.org",
    "https://www.gemini.com/uniswap/manifest.json",
    "https://raw.githubusercontent.com/voltfinance/swap-default-token-list/master/build/voltage-swap-default.tokenlist.json",
    "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json"
  ],
  [SupportedChainId.CELO]: ["https://raw.githubusercontent.com/celo-org/celo-token-list/main/celo.tokenlist.json"]
};
