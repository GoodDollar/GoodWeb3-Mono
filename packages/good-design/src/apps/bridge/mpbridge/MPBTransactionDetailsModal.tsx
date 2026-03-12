import React, { useMemo } from "react";
import { Box, HStack, Text, VStack, Spinner } from "native-base";

import BasicStyledModal from "../../../core/web3/modals/BasicStyledModal";
import { ExplorerLink } from "../../../core";
import { truncateMiddle } from "../../../utils/string";
import type { BridgeTransaction } from "./types";
import { capitalizeChain } from "./utils";

interface MPBTransactionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: BridgeTransaction;
  transactionHistory?: BridgeTransaction[];
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
  completed: "gray.900",
  bridging: "blue.500",
  pending: "gray.400",
  failed: "red.500"
};

const iconConfigMap = {
  completed: { bg: "blue.500", borderColor: "blue.300", content: "✓", spinner: false },
  bridging: { bg: "blue.500", borderColor: "blue.300", content: null, spinner: true },
  pending: { bg: "gray.200", borderColor: "gray.300", content: "○", spinner: false },
  failed: { bg: "red.500", borderColor: "red.300", content: "✕", spinner: false },
  default: { bg: "gray.200", borderColor: "gray.300", content: "○", spinner: false }
};

type StepStatus = "completed" | "pending" | "bridging" | "failed";

const PROGRESS_BY_STATUS: Record<string, { sourceGateway: StepStatus; destGateway: StepStatus; executed: StepStatus }> =
  {
    completed: { sourceGateway: "completed", destGateway: "completed", executed: "completed" },
    pending: { sourceGateway: "completed", destGateway: "bridging", executed: "pending" },
    bridging: { sourceGateway: "completed", destGateway: "bridging", executed: "pending" },
    failed: { sourceGateway: "completed", destGateway: "failed", executed: "failed" }
  };
const DEFAULT_PROGRESS: { sourceGateway: StepStatus; destGateway: StepStatus; executed: StepStatus } = {
  sourceGateway: "pending",
  destGateway: "pending",
  executed: "pending"
};

const StepIndicator = ({ status, text, isLast = false }: { status: StepStatus; text: string; isLast?: boolean }) => {
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
      <HStack alignItems="center" zIndex={4} space={3}>
        {getIcon()}
        <Text fontSize="sm" color={textColorMap[status]} fontWeight="medium">
          {text}
        </Text>
      </HStack>
      {!isLast && (
        <Box
          position="absolute"
          top="10px"
          left="4"
          width="2px"
          height="56px"
          bg={status === "completed" ? "blue.500" : "gray.300"}
          borderRadius="full"
        />
      )}
    </VStack>
  );
};

const MPBTransactionDetailsContent = ({
  transaction,
  transactionHistory
}: {
  transaction: BridgeTransaction;
  transactionHistory?: BridgeTransaction[];
}) => {
  const { amount, bridgeProvider, date, transactionHash, sourceChain, targetChain } = transaction;
  const sourceChainLabel = capitalizeChain(sourceChain || "source");
  const targetChainLabel = capitalizeChain(targetChain || "destination");

  const historyTx = useMemo(() => {
    return transactionHistory?.find(tx => tx.transactionHash === transactionHash || tx.id === transactionHash);
  }, [transactionHistory, transactionHash]);

  const status = historyTx?.status || transaction.status;

  const txDate = date ? new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString() : "Unknown";
  const progress = PROGRESS_BY_STATUS[status] ?? DEFAULT_PROGRESS;

  return (
    <VStack space={6} width="100%" paddingX={4}>
      <VStack space={2} alignItems="center">
        <Text fontSize="xs" color="gray.500">
          Bridged via {bridgeProvider?.toUpperCase()}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          +{amount} G$
        </Text>
        <Text fontSize="md" color="gray.500">
          {txDate}
        </Text>
      </VStack>

      <VStack space={4} bg="gray.50" padding={4} borderRadius="lg">
        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
          Progress
        </Text>
        <VStack space={4} alignItems="flex-start">
          <StepIndicator status={progress.sourceGateway} text={`G$'s sent from ${sourceChainLabel}`} />
          <StepIndicator status={progress.destGateway} text="Transfer in progress" />
          <StepIndicator status={progress.executed} text={`G$'s available on ${targetChainLabel}`} isLast={true} />
        </VStack>
      </VStack>

      <VStack space={4}>
        <VStack space={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
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

export const MPBTransactionDetailsModal = ({
  open,
  onClose,
  transaction,
  transactionHistory
}: MPBTransactionDetailsModalProps) => {
  return (
    <BasicStyledModal
      type="ctaX"
      modalStyle={{
        borderRadius: "16px",
        width: "450px",
        maxWidth: "450px",
        minWidth: "450px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
        marginLeft: "auto",
        marginRight: "auto"
      }}
      bodyStyle={{ padding: 8, bg: "white" }}
      show={open}
      onClose={onClose}
      title="Transaction Details"
      body={<MPBTransactionDetailsContent transaction={transaction} transactionHistory={transactionHistory} />}
      withOverlay="dark"
      withCloseButton
    />
  );
};
