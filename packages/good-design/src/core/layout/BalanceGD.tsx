import React, { FC } from "react";
import { Text, View } from "native-base";
import { useG$Balance } from "@gooddollar/web3sdk-v2";
import { Fraction } from "@uniswap/sdk-core";

interface BalanceGDProps {
  gdPrice?: Fraction;
}

const BalanceGD: FC<BalanceGDProps> = ({ gdPrice }) => {
  const { G$ } = useG$Balance("everyBlock");
  const { amount } = G$ || {};

  if (!amount || !gdPrice) return null;

  return (
    <View w="full" flexDirection="column" alignItems="center" mb="20" mt="45">
      <Text fontSize="md" fontWeight="medium" opacity={0.7} mb="0.5">
        YOUR BALANCE
      </Text>
      <Text fontSize="3xl" fontWeight="bold">
        {amount.format({ suffix: "", prefix: amount.currency.ticker + " " })}
      </Text>
      <Text fontSize="md" fontWeight="medium" opacity={0.7}>
        {"("}
        USD {gdPrice.multiply(amount.format({ suffix: "", thousandSeparator: "" })).toFixed(2)}
        {")"}
      </Text>
    </View>
  );
};

export default BalanceGD;
