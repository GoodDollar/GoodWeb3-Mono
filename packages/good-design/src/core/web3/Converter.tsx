import React, { memo, useCallback, useState } from "react";
import { Box, Divider, Input, Text, VStack } from "native-base";

import { CentreBox } from "../layout/CentreBox";
import ConverterCircle from "../../assets/svg/converter-circle.svg";
import { Image } from "../images";

const Converter = memo(({ gdPrice }: { gdPrice?: number }) => {
  const [gdAmount, setGdAmount] = useState<string | undefined>("100");
  const [usdAmount, setUsdAmount] = useState<string | undefined>("100");

  const calcAmount = useCallback(
    (inputType: "gd" | "usd", amount: string) => {
      const numAmount = Number(amount);
      if (gdPrice) {
        const koeff = inputType === "gd" ? gdPrice : 1 / gdPrice;
        const setter = inputType === "gd" ? setGdAmount : setUsdAmount;
        setter((numAmount * koeff).toFixed(2));
      }
    },
    [gdPrice, usdAmount, gdAmount]
  );

  const calcGd = (usdAmount: string) => {
    setUsdAmount(usdAmount);
    calcAmount("usd", usdAmount);
  };

  const calcUsd = (gdAmount: string) => {
    setGdAmount(gdAmount);
    calcAmount("gd", gdAmount);
  };

  // clearing input where it will show placeholder as value just typed in
  const clearInput = (e: any) => {
    e.target.value = "";
  };

  return (
    <CentreBox w="100%">
      <VStack w="100%">
        <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
          <Text>With</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox>
              <Input placeholder={usdAmount} onBlur={clearInput} onChangeText={calcGd} borderWidth="0" />
              <Text>cUSD</Text>
            </CentreBox>
            <CentreBox>
              <Text>cUSD symbol here</Text> {/* todo: add cUsd icon */}
            </CentreBox>
          </CentreBox>
        </Box>
        <Image src={ConverterCircle} w="12" h="12" style={{ resizeMode: "contain" }} />
        <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
          <Text>You'll get</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox>
              <Input placeholder={gdAmount} onBlur={clearInput} onChangeText={calcUsd} borderWidth="0" />
              <Text>G$</Text>
            </CentreBox>
            <CentreBox>
              <Text>G$ Symbol here</Text> {/* todo: add G$ icon */}
            </CentreBox>
          </CentreBox>
        </Box>
      </VStack>
    </CentreBox>
  );
});

export default Converter;
