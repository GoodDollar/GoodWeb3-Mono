import React from "react";
import { Box, Center, HStack, Text, VStack, Spinner } from "native-base";

import BasicStyledModal from "../../../core/web3/modals/BasicStyledModal";
import { GoodButton } from "../../../core/buttons";
import { ExplorerLink } from "../../../core";
import { truncateMiddle } from "../../../utils/string";
import { BridgeTransaction } from "./MPBBridgeTransactionCard";

interface MPBTransactionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: BridgeTransaction;
}

const ProgressStep = ({
  title,
  isCompleted,
  isInProgress,
  isFirst = false
}: {
  title: string;
  isCompleted: boolean;
  isInProgress: boolean;
  isFirst?: boolean;
}) => {
  const getStepIcon = () => {
    if (isCompleted) {
      return (
        <Box w="8" h="8" borderRadius="full" bg="green.500" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="sm" fontWeight="bold">
            ✓
          </Text>
        </Box>
      );
    }
    if (isInProgress) {
      return (
        <Box w="8" h="8" borderRadius="full" bg="blue.500" alignItems="center" justifyContent="center">
          <Spinner size="sm" color="white" />
        </Box>
      );
    }
    return (
      <Box w="8" h="8" borderRadius="full" bg="gray.300" alignItems="center" justifyContent="center">
        <Text color="gray.600" fontSize="sm" fontWeight="bold">
          ○
        </Text>
      </Box>
    );
  };

  const getLineColor = () => {
    if (isCompleted) return "blue.500";
    return "gray.300";
  };

  return (
    <VStack alignItems="center" space={2}>
      {getStepIcon()}
      <Text fontSize="xs" color={isCompleted || isInProgress ? "gray.700" : "gray.500"} textAlign="center">
        {title}
      </Text>
      {!isFirst && (
        <Box
          position="absolute"
          top="-8"
          left="50%"
          width="2px"
          height="16"
          bg={getLineColor()}
          style={{ transform: [{ translateX: -8 }] }}
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
          sourceGateway: true,
          destGateway: true,
          executed: true
        };
      case "pending":
        return {
          sourceGateway: true,
          destGateway: false,
          executed: false
        };
      case "bridging":
        return {
          sourceGateway: true,
          destGateway: true,
          executed: false
        };
      case "failed":
        return {
          sourceGateway: true,
          destGateway: false,
          executed: false
        };
      default:
        return {
          sourceGateway: false,
          destGateway: false,
          executed: false
        };
    }
  };

  const progress = getProgressSteps();
  const isDestGatewayInProgress = status === "bridging";

  return (
    <VStack space={4} width="100%">
      {/* Header */}
      <Center>
        <VStack space={2} alignItems="center">
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            Bridged via {bridgeProvider === "axelar" ? "Axelar" : "LayerZero"}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="green.600">
            +{amount} G$
          </Text>
          <Text fontSize="sm" color="gray.600">
            {txDate}
          </Text>
        </VStack>
      </Center>

      {/* Progress Steps */}
      <VStack space={4} alignItems="center" py={4}>
        <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={2}>
          Progress
        </Text>
        <HStack space={8} justifyContent="center" alignItems="flex-start">
          <ProgressStep
            title="Source Gateway Called"
            isCompleted={progress.sourceGateway}
            isInProgress={false}
            isFirst={true}
          />
          <ProgressStep
            title="Dest. Gateway Approved"
            isCompleted={progress.destGateway}
            isInProgress={isDestGatewayInProgress}
          />
          <ProgressStep title="Executed" isCompleted={progress.executed} isInProgress={false} />
        </HStack>
      </VStack>

      {/* Transaction Hashes */}
      <VStack space={3} pt={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
          Transaction Hash
        </Text>
        <HStack justifyContent="center">
          <ExplorerLink
            addressOrTx={transactionHash}
            chainId={transaction.chainId}
            text={truncateMiddle(transactionHash, 12)}
            fontStyle={{ fontSize: "sm", fontFamily: "mono", fontWeight: "normal" }}
            withIcon={false}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};

export const MPBTransactionDetailsModal = ({ open, onClose, transaction }: MPBTransactionDetailsModalProps) => {
  return (
    <BasicStyledModal
      type="ctaX"
      modalStyle={{
        borderLeftWidth: 10,
        borderColor: transaction.status === "completed" ? "#10B981" : "#3B82F6"
      }}
      show={open}
      onClose={onClose}
      title="Transaction Details"
      body={<MPBTransactionDetailsContent transaction={transaction} />}
      footer={
        <Center>
          <GoodButton _text={{ children: "Close" }} onPress={onClose} variant="secondary" size="md" />
        </Center>
      }
      withOverlay="dark"
      withCloseButton
    />
  );
};
