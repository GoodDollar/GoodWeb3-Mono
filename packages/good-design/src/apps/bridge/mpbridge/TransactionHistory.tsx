import React from "react";
import { Box, Spinner, Text, VStack } from "native-base";
import { BridgeTransactionList } from "./MPBBridgeTransactionCard";

interface TransactionHistoryProps {
  realTransactionHistory: any[];
  historyLoading: boolean;
  onTxDetailsPress: (tx: any) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  realTransactionHistory,
  historyLoading,
  onTxDetailsPress
}) => {
  return (
    <VStack space={4} width="100%">
      <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="goodBlue.600">
        Recent Transactions
      </Text>
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
