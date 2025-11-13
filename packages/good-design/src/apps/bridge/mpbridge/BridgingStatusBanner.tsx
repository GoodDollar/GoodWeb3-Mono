import React from "react";
import { Box, HStack, Spinner, Text } from "native-base";

interface BridgingStatusBannerProps {
  isBridging: boolean;
  bridgingStatus: string;
}

export const BridgingStatusBanner: React.FC<BridgingStatusBannerProps> = ({ isBridging, bridgingStatus }) => {
  if (!isBridging) return null;

  return (
    <Box borderRadius="lg" padding={4} backgroundColor="goodBlue.100" borderWidth="1" borderColor="goodBlue.300">
      <HStack space={3} alignItems="center">
        <Spinner size="sm" color="goodBlue.500" />
        <Text color="goodBlue.700" fontSize="sm" fontWeight="500">
          {bridgingStatus}
        </Text>
      </HStack>
    </Box>
  );
};
