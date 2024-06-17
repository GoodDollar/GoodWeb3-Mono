export {};
import { SupportedChainId } from "./chains";

type AddressMap = { [chainId: number]: string };

let config = {
  graphKey: ""
};

export const setConfig = (newConfig: { graphKey: string }) => {
  config = { ...newConfig };
};

export const VOLTAGE_EXCHANGE = `https://gateway-arbitrum.network.thegraph.com/api/${config.graphKey}/subgraphs/id/B4BGk9itvmRXzzNRAzBWwQARHRt3ZvLz11aWNVsZPT4`;

export const AAVE_STAKING: AddressMap = {
  [SupportedChainId.MAINNET]: `https://gateway-arbitrum.network.thegraph.com/api/${config.graphKey}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`
};
