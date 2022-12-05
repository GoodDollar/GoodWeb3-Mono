import React, { FC } from "react";
import { Text, View } from "native-base";

interface BalanceGDProps {
  goodDollarBalance?: string;
  dollarBalance?: string;
}

const BalanceGD: FC<BalanceGDProps> = ({ goodDollarBalance, dollarBalance }) => {
  return (
    <View w="full" flexDirection="column" alignItems="center" mb="80px" mt="45px">
      <Text fontSize="16px" fontWeight="500" opacity={0.7} mb="2px">
        YOUR BALANCE
      </Text>
      <Text fontSize="32px" fontWeight="700">
        {goodDollarBalance}
      </Text>
      <Text fontSize="16px" fontWeight="500" opacity={0.7}>
        {"("}
        USD {dollarBalance}
        {")"}
      </Text>
    </View>
  );
};

export default BalanceGD;
