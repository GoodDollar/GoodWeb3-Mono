import React from "react";
import { Box, HStack, Spinner, Text } from "native-base";

interface BridgingStatusBannerProps {
  isBridging: boolean;
  bridgingStatus: string;
  isError?: boolean;
}

export const BridgingStatusBanner: React.FC<BridgingStatusBannerProps> = ({ isBridging, bridgingStatus, isError }) => {
  if (!isBridging && !isError) return null;

  const bgColor = isError ? "red.50" : "goodBlue.100";
  const borderColor = isError ? "red.300" : "goodBlue.300";
  const textColor = isError ? "red.600" : "goodBlue.700";

  return (
    <Box borderRadius="lg" padding={4} backgroundColor={bgColor} borderWidth="1" borderColor={borderColor}>
      <HStack space={3} alignItems="center">
        {!isError && <Spinner size="sm" color="goodBlue.500" />}
        <Text color={textColor} fontSize="sm" fontWeight="500">
          {bridgingStatus}
        </Text>
      </HStack>
    </Box>
  );
};
