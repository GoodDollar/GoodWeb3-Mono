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

const StepIndicator = ({
  status,
  text,
  isLast = false
}: {
  status: "completed" | "pending" | "bridging" | "failed";
  text: string;
  isLast?: boolean;
}) => {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return (
          <Box
            w="8"
            h="8"
            borderRadius="50%"
            bg="green.500"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="green.300"
            shadow="md"
          >
            <Text color="white" fontSize="sm" fontWeight="bold">
              ✓
            </Text>
          </Box>
        );
      case "bridging":
        return (
          <Box
            w="8"
            h="8"
            borderRadius="50%"
            bg="blue.500"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="blue.300"
            shadow="md"
          >
            <Spinner size="sm" color="white" />
          </Box>
        );
      case "pending":
        return (
          <Box
            w="8"
            h="8"
            borderRadius="50%"
            bg="gray.200"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="gray.300"
            shadow="md"
          >
            <Text color="gray.600" fontSize="sm" fontWeight="bold">
              ○
            </Text>
          </Box>
        );
      case "failed":
        return (
          <Box
            w="8"
            h="8"
            borderRadius="50%"
            bg="red.500"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="red.300"
            shadow="md"
          >
            <Text color="white" fontSize="sm" fontWeight="bold">
              ✕
            </Text>
          </Box>
        );
      default:
        return (
          <Box
            w="8"
            h="8"
            borderRadius="50%"
            bg="gray.200"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="gray.300"
            shadow="md"
          >
            <Text color="gray.600" fontSize="sm" fontWeight="bold">
              ○
            </Text>
          </Box>
        );
    }
  };

  let textColor = "goodGrey.500";
  switch (status) {
    case "completed":
      textColor = "goodGrey.900";
      break;
    case "bridging":
      textColor = "goodBlue.600";
      break;
    case "pending":
      textColor = "goodGrey.400";
      break;
    case "failed":
      textColor = "goodRed.500";
      break;
    default:
      textColor = "goodGrey.400";
  }

  return (
    <VStack alignItems="flex-start" space={2} position="relative">
      <HStack alignItems="center" space={3}>
        {getIcon()}
        <Text fontSize="sm" color={textColor} fontWeight="medium">
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
    switch (status) {
      case "completed":
        return {
          sourceGateway: "completed" as const,
          destGateway: "completed" as const,
          executed: "completed" as const
        };
      case "pending":
        return {
          sourceGateway: "completed" as const,
          destGateway: "pending" as const,
          executed: "pending" as const
        };
      case "bridging":
        return {
          sourceGateway: "completed" as const,
          destGateway: "bridging" as const,
          executed: "pending" as const
        };
      case "failed":
        return {
          sourceGateway: "completed" as const,
          destGateway: "failed" as const,
          executed: "failed" as const
        };
      default:
        return {
          sourceGateway: "pending" as const,
          destGateway: "pending" as const,
          executed: "pending" as const
        };
    }
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
