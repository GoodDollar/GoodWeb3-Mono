import Web3 from "web3";
import { Currency, Price } from "@uniswap/sdk-core";
import memoize from "lodash/memoize";
import { delayedCacheClear } from "utils/memoize";
import { getContract } from "utils/getContract";
import { DAI, CDAI, G$ } from "constants/tokens";

/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export const g$ReservePrice = memoize<
  () => Promise<{ DAI: Price<Currency, Currency>; cDAI: Price<Currency, Currency> }>
>(async (): Promise<{ DAI: Price<Currency, Currency>; cDAI: Price<Currency, Currency> }> => {
  const httpProvider = new Web3.providers.HttpProvider("https://rpc.ankr.com/eth");
  const mainnetWeb3 = new Web3(httpProvider);
  const contract = getContract(
    1,
    "GoodReserveCDai",
    ["function currentPrice() view returns (uint256)", "function currentPriceDAI() view returns (uint256)"],
    mainnetWeb3
  );

  const [cdaiPrice, daiPrice] = await Promise.all([contract.currentPrice(), contract.currentPriceDAI()]);

  delayedCacheClear(g$ReservePrice);

  const priceAsDAI = new Price(DAI[1], G$[1], daiPrice, 100);
  const priceAscDAI = new Price(CDAI[1], G$[1], cdaiPrice, 100);
  return { DAI: priceAsDAI, cDAI: priceAscDAI };
});
