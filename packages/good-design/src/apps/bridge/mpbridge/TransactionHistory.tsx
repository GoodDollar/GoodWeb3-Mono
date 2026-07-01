import React from "react";
import { Box, Button, HStack, Spinner, Text, VStack } from "native-base";
import { BridgeTransactionList } from "./MPBBridgeTransactionCard";
import { capitalizeChain, getChainName } from "./utils";

interface TransactionHistoryProps {
  realTransactionHistory: any[];
  historyLoading: boolean;
  historyRefreshing: boolean;
  historyErrorsByChain: Record<number, string>;
  onRefresh: () => void;
  onTxDetailsPress: (tx: any) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  realTransactionHistory,
  historyLoading,
  historyRefreshing,
  historyErrorsByChain,
  onRefresh,
  onTxDetailsPress
}) => {
  const errorEntries = Object.entries(historyErrorsByChain || {});

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
              Some networks could not refresh right now.
            </Text>
            {errorEntries.map(([chainId, message]) => (
              <Text key={chainId} fontSize="xs" color="yellow.700">
                {capitalizeChain(getChainName(Number(chainId)))}: {message}
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
      ) : realTransactionHistory.length > 0 ? (
        <Box maxH="400px" overflowY="auto">
          <BridgeTransactionList transactions={realTransactionHistory} onTxDetailsPress={onTxDetailsPress} />
        </Box>
      ) : (
        <Box p={6} bg="goodGrey.50" borderRadius="lg" alignItems="center">
          <Text fontSize="sm" color="goodGrey.600" textAlign="center">
            No recent bridge transactions found
          </Text>
          <Text fontSize="xs" color="goodGrey.500" mt={2} textAlign="center">
            Make sure your wallet is connected to see your bridge transactions
          </Text>
        </Box>
      )}
    </VStack>
  );
};
