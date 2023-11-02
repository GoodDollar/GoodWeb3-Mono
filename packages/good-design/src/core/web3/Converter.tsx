import React, { memo } from "react";
import { Box, Circle, Divider, Text, VStack } from "native-base";

import { CentreBox } from "../layout/CentreBox";

const Converter = memo(() => (
  <CentreBox w="100%">
    <VStack w="100%">
      <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
        <Text>With</Text>
        <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
        <CentreBox flexDirection="row" justifyContent="space-between">
          <CentreBox>
            <Text>10000</Text>
            <Text>cUSD</Text>
          </CentreBox>
          <CentreBox>
            <Text>cUSD symbol here</Text>
          </CentreBox>
        </CentreBox>
      </Box>
      <Circle bg="emerald.100" w="24" h="24" />
      <Box bg="goodWhite.100" p={4} borderRadius={2} justifyContent="flex-start" justifyItems="flex-start">
        <Text>You'll get</Text>
        <Divider orientation="horizontal" w="100%" bg="goodGrey.400" mb={2} mt={2} />
        <CentreBox flexDirection="row" justifyContent="space-between">
          <CentreBox>
            <Text>10000</Text>
            <Text>G$</Text>
          </CentreBox>
          <CentreBox>
            <Text>G$ Symbol here</Text>
          </CentreBox>
        </CentreBox>
      </Box>
    </VStack>
  </CentreBox>
));

export default Converter;
