import React, { FC, memo } from "react";
import { Text, View, Box } from "native-base";
import { useG$Balance, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { Fraction } from "@uniswap/sdk-core";
import { CurrencyValue } from "@usedapp/core";

interface BalanceGDProps {
  chain?: number;
  gdPrice?: Fraction;
}

const BalanceCopy = ({ heading, subHeading }: { heading: string; subHeading: string }) => (
  <Box mb="4">
    <Text fontSize="2xl" fontWeight="extrabold" fontFamily="heading" mb="0.5" color="main">
      {heading}
    </Text>
    <Text fontSize="sm" fontWeight="normal" fontFamily="subheading" color="goodGrey.500">
      {subHeading}
    </Text>
  </Box>
);

const BalanceView: FC<Required<BalanceGDProps> & { amount: CurrencyValue }> = memo(({ gdPrice, amount, chain }) => {
  const network = chain === 122 ? "Fuse" : "Celo";
  const copies = [
    {
      heading: "Your Balance",
      subheading: `on ${network}`
    },
    {
      heading: amount.format({ suffix: "", prefix: amount.currency.ticker + " " }),
      subheading: "(USD " + gdPrice.multiply(amount.format({ suffix: "", thousandSeparator: "" })).toFixed(2) + ")"
    }
  ];

  return (
    <View w="full" flexDirection="column" alignItems="center">
      {copies.map(copy => (
        <BalanceCopy key={copy.heading.charAt(0)} heading={copy.heading} subHeading={copy.subheading} />
      ))}
    </View>
  );
});

const BalanceGD: FC<BalanceGDProps> = ({ gdPrice }) => {
  const { G$ } = useG$Balance(12);
  const { chainId } = useGetEnvChainId();
  const { amount } = G$ || {};

  return !amount || !gdPrice ? null : <BalanceView amount={amount} gdPrice={gdPrice} chain={chainId} />;
};

export default BalanceGD;
