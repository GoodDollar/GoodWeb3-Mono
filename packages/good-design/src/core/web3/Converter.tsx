import React, { memo, useCallback, useState } from "react";
import { Box, Divider, Input, Text, VStack } from "native-base";

import { CentreBox } from "../layout/CentreBox";
import { Image } from "../images";

import ConverterCircle from "../../assets/svg/converter-circle.svg";
import cUsdLogo from "../../assets/svg/cusd.svg";
import gdLogo from "../../assets/svg/gdLogo.svg";

const Converter = memo(({ gdPrice }: { gdPrice?: number }) => {
  const [gdAmount, setGdAmount] = useState<string | undefined>("100");
  const [usdAmount, setUsdAmount] = useState<string | undefined>("100");

  const calcAmount = useCallback(
    (inputType: "gd" | "usd", amount: string) => {
      const numAmount = Number(amount);
      if (gdPrice) {
        const koeff = inputType === "gd" ? gdPrice : 1 / gdPrice;
        const setter = inputType === "usd" ? setGdAmount : setUsdAmount;
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
        <Image
          src={ConverterCircle}
          w="12"
          h="12"
          style={{ resizeMode: "contain" }}
          zIndex={1}
          maxW="100%"
          position="absolute"
          left="45%"
          top="40%"
        />
        <Box bg="goodWhite.100" p={4} borderRadius={2} mb={6} justifyContent="flex-start" justifyItems="flex-start">
          <Text>With</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox alignItems="flex-start">
              <Input
                fontSize={6}
                maxW={220}
                ml={0}
                _focus={{ backgroundColor: "none" }}
                pl={0}
                fontWeight={700}
                placeholder={usdAmount}
                variant="unstyled"
                onBlur={clearInput}
                onChangeText={calcGd}
              />
              <Text>cUSD</Text>
            </CentreBox>
            <CentreBox w="100" h="50" backgroundColor="white" flexDirection="row" justifyContent="space-around">
              <Image src={cUsdLogo} w="8" h="8" style={{ resizeMode: "contain" }} borderRadius="md" />
              <Text fontFamily="subheading" fontSize="sm" fontWeight="400" color="goodGrey.700">
                cUSD
              </Text>
            </CentreBox>
          </CentreBox>
        </Box>
        <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
          <Text>You'll get</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox alignItems="flex-start">
              <Input
                fontSize={6}
                maxW={220}
                ml={0}
                _focus={{ backgroundColor: "none" }}
                pl={0}
                fontWeight={700}
                placeholder={gdAmount}
                variant="unstyled"
                onBlur={clearInput}
                onChangeText={calcUsd}
              />
              <Text>G$</Text>
            </CentreBox>
            <CentreBox w="100" h="50" backgroundColor="white" flexDirection="row" justifyContent="space-around">
              <Image src={gdLogo} w="8" h="8" style={{ resizeMode: "contain" }} borderRadius="md" />
              <Text fontFamily="subheading" fontSize="sm" fontWeight="400" color="goodGrey.700">
                G$
              </Text>{" "}
            </CentreBox>
          </CentreBox>
        </Box>
      </VStack>
    </CentreBox>
  );
});

export default Converter;
