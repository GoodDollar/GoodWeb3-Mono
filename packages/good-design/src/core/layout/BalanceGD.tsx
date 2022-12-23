import React, { FC, memo } from "react";
import { Text, View } from "native-base";
import { useG$Balance } from "@gooddollar/web3sdk-v2";
import { Fraction } from "@uniswap/sdk-core";
import { CurrencyValue } from "@usedapp/core";

interface BalanceGDProps {
  gdPrice?: Fraction;
}

const BalanceView: FC<Required<BalanceGDProps> & { amount: CurrencyValue }> = memo(({ gdPrice, amount }) => (
  <View w="full" flexDirection="column" alignItems="center" mb="45" mt="45">
    <Text fontSize="md" fontWeight="500" opacity={0.7} mb="0.5">
      YOUR BALANCE
    </Text>
    <Text fontSize="3xl" bold style={{fontWeight: "bold"}}>
      {amount.format({ suffix: "", prefix: amount.currency.ticker + " " })}
    </Text>
    <Text fontSize="md" fontWeight="500" opacity={0.7}>
      {"("}
      USD {gdPrice.multiply(amount.format({ suffix: "", thousandSeparator: "" })).toFixed(2)}
      {")"}
    </Text>
  </View>
));

const BalanceGD: FC<BalanceGDProps> = ({ gdPrice }) => {
  const { G$ } = useG$Balance("everyBlock");
  const { amount } = G$ || {};
  
  return !amount || !gdPrice ? null : <BalanceView amount={amount} gdPrice={gdPrice} />;
};

export default BalanceGD;
