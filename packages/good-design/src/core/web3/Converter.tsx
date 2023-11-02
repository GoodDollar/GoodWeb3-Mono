import React, { memo, useCallback, useState } from "react";
import { Box, Divider, Input, Text, VStack } from "native-base";

import { CentreBox } from "../layout/CentreBox";

const ConverterCircle = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="48" width="48" height="48" rx="24" transform="rotate(-90 0 48)" fill="#3E3F40" />
    <path
      d="M18.6668 34.6667L18.3133 35.0203L18.6668 35.3739L19.0204 35.0203L18.6668 34.6667ZM18.6668 23.3334L18.1668 23.3334L18.6668 23.3334ZM21.3335 21.8334C21.6096 21.8334 21.8335 21.6096 21.8335 21.3334C21.8335 21.0573 21.6096 20.8334 21.3335 20.8334L21.3335 21.8334ZM12.9799 29.687L18.3133 35.0203L19.0204 34.3132L13.687 28.9799L12.9799 29.687ZM19.0204 35.0203L24.3537 29.687L23.6466 28.9799L18.3133 34.3132L19.0204 35.0203ZM19.1668 34.6667L19.1668 23.3334L18.1668 23.3334L18.1668 34.6667L19.1668 34.6667ZM20.6668 21.8334L21.3335 21.8334L21.3335 20.8334L20.6668 20.8334L20.6668 21.8334ZM19.1668 23.3334C19.1668 22.505 19.8384 21.8334 20.6668 21.8334L20.6668 20.8334C19.2861 20.8334 18.1668 21.9527 18.1668 23.3334L19.1668 23.3334Z"
      fill="white"
    />
    <path
      d="M29.3333 13.3333L28.9798 12.9797L29.3333 12.6261L29.6869 12.9797L29.3333 13.3333ZM29.3333 24.6666L28.8333 24.6666L29.3333 24.6666ZM26.6667 27.1666C26.3905 27.1666 26.1667 26.9427 26.1667 26.6666C26.1667 26.3904 26.3905 26.1666 26.6667 26.1666L26.6667 27.1666ZM23.6464 18.313L28.9798 12.9797L29.6869 13.6868L24.3536 19.0201L23.6464 18.313ZM29.6869 12.9797L35.0202 18.313L34.3131 19.0201L28.9798 13.6868L29.6869 12.9797ZM29.8333 13.3333L29.8333 24.6666L28.8333 24.6666L28.8333 13.3333L29.8333 13.3333ZM27.3333 27.1666L26.6667 27.1666L26.6667 26.1666L27.3333 26.1666L27.3333 27.1666ZM29.8333 24.6666C29.8333 26.0473 28.714 27.1666 27.3333 27.1666L27.3333 26.1666C28.1618 26.1666 28.8333 25.495 28.8333 24.6666L29.8333 24.6666Z"
      fill="white"
    />
  </svg>
);

const Converter = memo(({ gdPrice }: { gdPrice?: number }) => {
  const [gdAmount, setGdAmount] = useState("100");

  const calcGd = useCallback(
    (usdAmount: string) => {
      const amount = Number(usdAmount);
      if (gdPrice) {
        const gdAmount = (amount / gdPrice).toFixed(6);
        setGdAmount(gdAmount);
      }

      console.log("calc gd");
    },
    [gdPrice]
  );

  return (
    <CentreBox w="100%">
      <VStack w="100%">
        <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
          <Text>With</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox>
              <Input placeholder="100" onChangeText={calcGd} borderWidth="0" />
              <Text>cUSD</Text>
            </CentreBox>
            <CentreBox>
              <Text>cUSD symbol here</Text>
            </CentreBox>
          </CentreBox>
        </Box>
        <ConverterCircle />
        <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
          <Text>You'll get</Text>
          <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
          <CentreBox flexDirection="row" justifyContent="space-between">
            <CentreBox>
              <Input placeholder={gdAmount} borderWidth="0" />
              <Text>G$</Text>
            </CentreBox>
            <CentreBox>
              <Text>G$ Symbol here</Text>
            </CentreBox>
          </CentreBox>
        </Box>
      </VStack>
    </CentreBox>
  );
});

export default Converter;
