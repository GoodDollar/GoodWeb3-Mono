import Web3 from "web3";
import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber, ethers } from "ethers";

import { ContributionCalcContract } from "contracts/ContributionCalcContract";
import { debug, debugGroup, debugGroupEnd } from "utils/debug";

const AZ = ethers.constants.AddressZero;

/**
 * Calculated exit contribution for an account.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount} G$Currency Amount of G$Currency account wants to sell.
 * @param {string} account Account's address.
 * @returns {CurrencyAmount} Exit contribution ratio.
 */
export async function calculateExitContribution(
  web3: Web3,
  G$Currency: CurrencyAmount<Currency>
): Promise<CurrencyAmount<Currency>> {
  const goodReserveCDai = await ContributionCalcContract(web3);

  debugGroup("Exit contribution");

  debug("G$", G$Currency.toFixed(2));

  const G$CurrencyDiscount = G$Currency;

  if (G$CurrencyDiscount.equalTo(0)) {
    debugGroupEnd("Exit contribution");
    return CurrencyAmount.fromRawAmount(G$Currency.currency, "0");
  }

  const contributionRaw = (await goodReserveCDai.methods
    .calculateContribution(AZ, AZ, AZ, AZ, G$CurrencyDiscount.multiply(G$CurrencyDiscount.decimalScale).toExact())
    .call()) as BigNumber;

  debugGroupEnd("Exit contribution");
  const contribution = CurrencyAmount.fromRawAmount(G$Currency.currency, contributionRaw.toString());
  return contribution;
}
