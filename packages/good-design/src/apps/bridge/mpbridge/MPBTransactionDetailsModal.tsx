import React from "react";
import { Box, HStack, Text, VStack, Spinner } from "native-base";

import BasicStyledModal from "../../../core/web3/modals/BasicStyledModal";
import { ExplorerLink } from "../../../core";
import { truncateMiddle } from "../../../utils/string";
import { BridgeTransaction } from "./MPBBridgeTransactionCard";

interface MPBTransactionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: BridgeTransaction;
}

const iconBoxStyles = {
  w: "8",
  h: "8",
  borderRadius: "50%",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: "2px",
  shadow: "md"
};

const textColorMap = {
  completed: "goodGrey.900",
  bridging: "goodBlue.600",
  pending: "goodGrey.400",
  failed: "goodRed.500"
};

const iconConfigMap = {
  completed: { bg: "green.500", borderColor: "green.300", content: "✓", spinner: false },
  bridging: { bg: "blue.500", borderColor: "blue.300", content: null, spinner: true },
  pending: { bg: "gray.200", borderColor: "gray.300", content: "○", spinner: false },
  failed: { bg: "red.500", borderColor: "red.300", content: "✕", spinner: false },
  default: { bg: "gray.200", borderColor: "gray.300", content: "○", spinner: false }
};

const StepIndicator = ({
  status,
  text,
  isLast = false
}: {
  status: "completed" | "pending" | "bridging" | "failed";
  text: string;
  isLast?: boolean;
}) => {
  const config = iconConfigMap[status] || iconConfigMap.default;

  const getIcon = () => (
    <Box {...iconBoxStyles} bg={config.bg} borderColor={config.borderColor}>
      {config.spinner ? (
        <Spinner size="sm" color="white" />
      ) : (
        <Text color="white" fontSize="sm" fontWeight="bold">
          {config.content}
        </Text>
      )}
    </Box>
  );

  return (
    <VStack alignItems="flex-start" space={2} position="relative">
      <HStack alignItems="center" space={3}>
        {getIcon()}
        <Text fontSize="sm" color={textColorMap[status]} fontWeight="medium">
          {text}
        </Text>
      </HStack>
      {!isLast && (
        <Box
          position="absolute"
          top="10"
          left="4"
          width="2px"
          height="24"
          bg={status === "completed" ? "goodBlue.600" : "goodGrey.300"}
          borderRadius="full"
        />
      )}
    </VStack>
  );
};

const MPBTransactionDetailsContent = ({ transaction }: { transaction: BridgeTransaction }) => {
  const { amount, bridgeProvider, status, date, transactionHash } = transaction;

  const txDate = date ? new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString() : "";

  // Determine progress based on status
  const getProgressSteps = () => {
    const progressMap = {
      completed: {
        sourceGateway: "completed" as const,
        destGateway: "completed" as const,
        executed: "completed" as const
      },
      pending: { sourceGateway: "completed" as const, destGateway: "pending" as const, executed: "pending" as const },
      bridging: { sourceGateway: "completed" as const, destGateway: "bridging" as const, executed: "pending" as const },
      failed: { sourceGateway: "completed" as const, destGateway: "failed" as const, executed: "failed" as const },
      default: { sourceGateway: "pending" as const, destGateway: "pending" as const, executed: "pending" as const }
    };

    return progressMap[status] || progressMap.default;
  };

  const progress = getProgressSteps();

  return (
    <VStack space={6} width="100%" paddingX={4}>
      {/* Header */}
      <VStack space={3} alignItems="center">
        <Text fontSize="xs" color="goodGrey.500">
          Bridged via {bridgeProvider?.toUpperCase()}
        </Text>
        <Text fontSize="3xl" fontWeight="bold" color="goodGrey.900">
          +{amount} G$
        </Text>
        <Text fontSize="sm" color="goodGrey.500">
          {txDate}
        </Text>
      </VStack>

      {/* Progress Steps */}
      <VStack space={4} bg="goodGrey.50" padding={4} borderRadius="lg">
        <Text fontSize="sm" fontWeight="semibold" color="goodGrey.800">
          Progress
        </Text>
        <VStack space={4} alignItems="flex-start">
          <StepIndicator status={progress.sourceGateway} text="Source Gateway Called" />
          <StepIndicator status={progress.destGateway} text="Dest. Gateway Approved" />
          <StepIndicator status={progress.executed} text="Executed" isLast={true} />
        </VStack>
      </VStack>

      {/* Transaction Details */}
      <VStack space={4}>
        <VStack space={2}>
          <Text fontSize="sm" fontWeight="medium" color="goodGrey.600">
            Source Transaction
          </Text>
          <ExplorerLink
            addressOrTx={transactionHash}
            chainId={transaction.chainId}
            text={truncateMiddle(transactionHash, 12)}
            fontStyle={{ fontSize: "sm", fontFamily: "mono", fontWeight: "normal" }}
            withIcon={false}
          />
        </VStack>
      </VStack>
    </VStack>
  );
};

export const MPBTransactionDetailsModal = ({ open, onClose, transaction }: MPBTransactionDetailsModalProps) => {
  return (
    <BasicStyledModal
      type="ctaX"
      modalStyle={{
        borderRadius: "10px",
        width: "400px",
        maxWidth: "400px",
        minWidth: "400px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
        marginLeft: "auto",
        marginRight: "auto"
      }}
      show={open}
      onClose={onClose}
      title="Transaction Details"
      body={<MPBTransactionDetailsContent transaction={transaction} />}
      withOverlay="dark"
      withCloseButton
    />
  );
};
