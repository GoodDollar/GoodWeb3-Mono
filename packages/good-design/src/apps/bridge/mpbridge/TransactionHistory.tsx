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
    <VStack space={3} mt={6}>
      <Text fontFamily="heading" fontSize="lg" fontWeight="700" color="goodBlue.600">
        Recent Transactions:
      </Text>
      {historyLoading ? (
        <Box p={4} bg="goodGrey.50" borderRadius="lg" alignItems="center">
          <Spinner size="sm" color="goodBlue.500" />
          <Text mt={2} fontSize="sm" color="goodGrey.600">
            Loading transaction history...
          </Text>
        </Box>
      ) : realTransactionHistory.length > 0 ? (
        <BridgeTransactionList transactions={realTransactionHistory} onTxDetailsPress={onTxDetailsPress} />
      ) : (
        <Box p={4} bg="goodGrey.50" borderRadius="lg" alignItems="center">
          <Text fontSize="sm" color="goodGrey.600">
            No recent bridge transactions found
          </Text>
          <Text fontSize="xs" color="goodGrey.500" mt={1}>
            Make sure your wallet is connected to see your bridge transactions
          </Text>
        </Box>
      )}
    </VStack>
  );
};
