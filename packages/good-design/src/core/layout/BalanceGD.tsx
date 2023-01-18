import React, { FC, memo } from "react";
import { Text, View } from "native-base";
import { useG$Balance, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { Fraction } from "@uniswap/sdk-core";
import { CurrencyValue, QueryParams } from "@usedapp/core";

interface BalanceGDProps {
  gdPrice?: Fraction;
  refresh?: QueryParams["refresh"];
  requiredChainId?: number;
}

const BalanceGD: FC<BalanceGDProps> = ({ gdPrice, requiredChainId, refresh = "never" }) => {
  const { chainId } = useGetEnvChainId(requiredChainId);
  const { G$ } = useG$Balance(refresh, chainId);

  return !G$ || !gdPrice ? null : (
    <BalanceView amount={G$} gdPrice={gdPrice} refresh={refresh} requiredChainId={chainId} />
  );
};

const BalanceView: FC<Required<BalanceGDProps> & { amount: CurrencyValue }> = memo(({ gdPrice, amount }) => (
  <View w="full" flexDirection="column" alignItems="center" mb="45" mt="45">
    <Text fontSize="md" fontWeight="medium" opacity={0.7} mb="0.5">
      YOUR BALANCE
    </Text>
    <Text fontSize="3xl" bold style={{ fontWeight: "bold" }}>
      {amount.format({ suffix: "", prefix: amount.currency.ticker + " " })}
    </Text>
    <Text fontSize="md" fontWeight="medium" opacity={0.7}>
      {"("}
      USD {gdPrice.multiply(amount.format({ suffix: "", thousandSeparator: "" })).toFixed(2)}
      {")"}
    </Text>
  </View>
));

export default BalanceGD;
