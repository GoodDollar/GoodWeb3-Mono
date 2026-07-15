import React from "react";
import { Box, Button, HStack, Spinner, Text, VStack } from "native-base";
import { ExplorerLink } from "../../../core";
import { BridgeTransactionList } from "./MPBBridgeTransactionCard";
import { capitalizeChain, getChainName } from "./utils";

interface TransactionHistoryProps {
  realTransactionHistory: any[];
  historyLoading: boolean;
  historyRefreshing: boolean;
  historyErrorsByChain: Record<number, string>;
  explorerChainId?: number;
  explorerAddress?: string;
  onRefresh: () => void;
  onTxDetailsPress: (tx: any) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  realTransactionHistory,
  historyLoading,
  historyRefreshing,
  historyErrorsByChain,
  explorerChainId,
  explorerAddress,
  onRefresh,
  onTxDetailsPress
}) => {
  const errorEntries = Object.entries(historyErrorsByChain || {});
  const hasTransactionHistory = realTransactionHistory.length > 0;

  return (
    <VStack space={4} width="100%">
      <HStack justifyContent="space-between" alignItems="center" space={3}>
        <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="goodBlue.600">
          Recent Transactions
        </Text>
        <Button
          variant="outline"
          size="sm"
          borderColor="goodBlue.500"
          _text={{ color: "goodBlue.500", fontWeight: "600" }}
          isDisabled={historyLoading || historyRefreshing}
          isLoading={historyRefreshing}
          onPress={onRefresh}
        >
          Refresh
        </Button>
      </HStack>
      <VStack space={1}>
        <Text fontSize="xs" color="goodGrey.600">
          History builds as you use this bridge. We check up to the latest 5,000 blocks on each supported network.
        </Text>
        <Text fontSize="xs" color="goodGrey.500">
          Older transactions or activity from another device may not appear.
        </Text>
        {explorerChainId && explorerAddress ? (
          <ExplorerLink
            chainId={explorerChainId}
            addressOrTx={explorerAddress}
            text="View this wallet on the connected network explorer"
            fontStyle={{ fontSize: "xs", fontFamily: "subheading", fontWeight: 600 }}
          />
        ) : null}
      </VStack>
      {historyRefreshing && !historyLoading ? (
        <HStack alignItems="center" space={2}>
          <Spinner size="sm" color="goodBlue.500" />
          <Text fontSize="xs" color="goodGrey.600">
            Refreshing transaction history...
          </Text>
        </HStack>
      ) : null}
      {errorEntries.length > 0 ? (
        <Box p={4} bg="yellow.50" borderRadius="lg" borderWidth="1" borderColor="yellow.200">
          <VStack space={2}>
            <Text fontSize="sm" color="yellow.800" fontWeight="600">
              Some transaction history could not be refreshed.
            </Text>
            {errorEntries.map(([chainId]) => (
              <Text key={chainId} fontSize="xs" color="yellow.700">
                Could not fetch history for {capitalizeChain(getChainName(Number(chainId)))} at this time. You can try
                to reload or try later.
              </Text>
            ))}
          </VStack>
        </Box>
      ) : null}
      {historyLoading ? (
        <Box p={6} bg="goodGrey.50" borderRadius="lg" alignItems="center">
          <Spinner size="sm" color="goodBlue.500" />
          <Text mt={3} fontSize="sm" color="goodGrey.600">
            Loading transaction history...
          </Text>
        </Box>
      ) : hasTransactionHistory ? (
        <Box maxH="400px" overflowY="auto">
          <BridgeTransactionList transactions={realTransactionHistory} onTxDetailsPress={onTxDetailsPress} />
        </Box>
      ) : (
        <Box p={6} bg="goodGrey.50" borderRadius="lg" alignItems="center">
          <Text fontSize="sm" color="goodGrey.600" textAlign="center">
            No bridge transactions found in the latest 5,000 blocks
          </Text>
          <Text fontSize="xs" color="goodGrey.500" mt={2} textAlign="center">
            Make sure your wallet is connected to see your bridge transactions
          </Text>
        </Box>
      )}
    </VStack>
  );
};
