import React from "react";
import { Box, Text, VStack } from "native-base";
import { Platform } from "react-native";

import { Web3ActionButton } from "../../../advanced";
import { MPBTransactionDetailsModal } from "./MPBTransactionDetailsModal";
import { BridgeSuccessModal } from "./BridgeSuccessModal";
import { ErrorModal } from "../../../core/web3/modals/ErrorModal";

import type { MPBBridgeProps } from "./types";
import { ChainSelector } from "./ChainSelector";
import { BridgeProviderSelector } from "./BridgeProviderSelector";
import { AmountInput } from "./AmountInput";
import { ExpectedOutput } from "./ExpectedOutput";
import { FeeInformation } from "./FeeInformation";
import { TransactionHistory } from "./TransactionHistory";
import { BridgingStatusBanner } from "./BridgingStatusBanner";
import { useMPBBridgeViewController } from "./feature/useMPBBridgeViewController";

const cardShadowStyle = Platform.select({
  web: { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" },
  default: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8
  }
});

export const MPBBridge = (props: MPBBridgeProps) => {
  const view = useMPBBridgeViewController(props);

  return (
    <VStack space={8} alignSelf="center">
      {view.modals.txDetails.shouldRender ? <MPBTransactionDetailsModal {...view.modals.txDetails.props} /> : null}

      <BridgeSuccessModal {...view.modals.success} />

      <ErrorModal {...view.modals.error} />

      <VStack space={3} alignItems="center">
        <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="goodBlue.600">
          Main Bridge
        </Text>
        <Text
          fontFamily="subheading"
          fontSize="xs"
          color="goodGrey.100"
          textAlign="center"
          maxWidth="600"
          lineHeight="lg"
        >
          Seamlessly bridge G$ across Fuse, Celo, Ethereum and XDC, enabling versatile use of G$ across multiple
          ecosystems.
        </Text>
      </VStack>

      {view.statusBanner.shouldShow && <BridgingStatusBanner {...view.statusBanner} />}

      {view.feeErrorBanner.shouldShow && (
        <Box bg="red.50" borderRadius="lg" padding="4" borderWidth="1" borderColor="red.300">
          <Text color="red.600" fontSize="sm" fontWeight="500">
            {view.feeErrorBanner.message}
          </Text>
        </Box>
      )}

      <Box borderRadius="xl" padding="8" backgroundColor="white" style={cardShadowStyle}>
        <VStack space={8}>
          <BridgeProviderSelector {...view.bridgeProviderSelectorProps} />

          <VStack space={6}>
            <ChainSelector {...view.chainSelectorProps} />

            <AmountInput {...view.amountInputProps} />

            <ExpectedOutput {...view.expectedOutputProps} />

            <Web3ActionButton {...view.actionButtonProps} />

            <FeeInformation {...view.feeInformationProps} />
          </VStack>
        </VStack>
      </Box>

      <Box borderRadius="xl" padding="8" backgroundColor="white" style={cardShadowStyle}>
        <TransactionHistory {...view.transactionHistoryProps} />
      </Box>
    </VStack>
  );
};
