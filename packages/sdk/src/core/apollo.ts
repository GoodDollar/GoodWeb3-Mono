export {};
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types";
import { Fraction } from "@uniswap/sdk-core";
import { once } from "lodash";
import memoize from "lodash/memoize";
import { AAVE_STAKING, VOLTAGE_EXCHANGE } from "constants/graphql";
import { debug, debugGroup, debugGroupEnd } from "utils/debug";
import { delayedCacheClear } from "utils/memoize";
import { Token } from "@uniswap/sdk-core";

/**
 * Returns Apollo client to make GraphQL requests.
 * @param {string} uri Client URI.
 * @returns {ApolloClient}
 */
export function getClient(uri: string): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({ uri, cache: new InMemoryCache() });
}

type StakingAPY = {
  supplyAPY: Fraction;
  incentiveAPY: Fraction;
};

/**
 * Returns AAVE staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenSymbol Token symbol.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export const aaveStaking = memoize(
  async (chainId: number, token: Token): Promise<StakingAPY> => {
    const client = getClient(AAVE_STAKING[chainId]);

    const {
      data: {
        aave,
        assetToken,
        reserves: [{ aEmissionPerSecond, liquidityRate, totalATokenSupply }] = [
          { aEmissionPerSecond: 0, liquidityRate: 0, totalATokenSupply: 0 }
        ]
      }
    } = await client.query({
      query: gql`{ 
                aave:priceOracleAsset(id: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9") {    
                    priceInEth
                  }
                  assetToken:priceOracleAsset(id: "${token.address.toLowerCase()}") {    
                    priceInEth
                  }
                reserves( first: 1, where: { underlyingAsset: "${token.address.toLowerCase()}", liquidityRate_gt: 0 }, orderBy: liquidityRate, orderDirection: desc) { totalATokenSupply, aEmissionPerSecond, liquidityRate } 
            }`
    });
    debugGroup("AAVE Staking", { liquidityRate, aEmissionPerSecond, aave, totalATokenSupply });

    //depositAPR = liquidityRate/RAY
    //depositAPY = ((1 + (depositAPR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1
    // const percentDepositAPR = new Fraction(1, 1)
    const depositAPY = (1 + liquidityRate / (1e27 * 31_536_000)) ** 31_536_000 - 1;
    //incentiveDepositAPRPercent = 100 * (aEmissionPerYear * REWARD_PRICE_ETH * WEI_DECIMALS)/
    //                  (totalATokenSupply * TOKEN_PRICE_ETH * UNDERLYING_TOKEN_DECIMALS)

    const aEmissionPerYear = new Fraction(aEmissionPerSecond).multiply(31_536_000);
    const incentiveAPR = aEmissionPerYear
      .multiply(aave?.priceInEth || 0)
      .divide(totalATokenSupply * assetToken.priceInEth * 10 ** (18 - token.decimals));

    debug("percentDepositAPY", depositAPY);
    debug("percentDepositAPR", incentiveAPR.toSignificant(6));
    debugGroupEnd("AAVE Staking");

    delayedCacheClear(aaveStaking);

    return { supplyAPY: new Fraction((depositAPY * 10 ** 10).toFixed(0), 10 ** 10), incentiveAPY: incentiveAPR };
  },
  (chainId, token) => chainId + token.address
);

export const voltagePairData = once(async (): Promise<any> => {
  const client = getClient(VOLTAGE_EXCHANGE);

  const { data } = await client.query({
    query: gql`
      query GetPairDayDatas {
        pairDayDatas(orderBy: date, orderDirection: desc, where: { reserveUSD_gt: 100 }) {
          pairAddress
        }
      }
    `
  });

  return data?.pairDayDatas;
});
