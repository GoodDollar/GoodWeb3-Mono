import React, { useCallback } from "react";
import { Center, HStack, Pressable, ScrollView, Text, VStack, Box, Spinner } from "native-base";
import { Platform } from "react-native";
import moment from "moment";

import { withTheme } from "../../../theme/hoc";

export type BridgeTransaction = {
  id: string;
  transactionHash: string;
  sourceChain: string;
  targetChain: string;
  amount: string;
  bridgeProvider: "axelar" | "layerzero";
  status: "completed" | "pending" | "failed" | "bridging";
  date: Date;
  chainId: number;
};

export type BridgeTransactionCardProps = {
  transaction: BridgeTransaction;
  onTxDetailsPress?: (transaction: BridgeTransaction) => void;
};

export const BridgeTransactionCard = withTheme({ name: "BridgeTransactionCard" })(
  ({ transaction, onTxDetailsPress }: BridgeTransactionCardProps) => {
    const { amount, bridgeProvider, status, date, sourceChain, targetChain } = transaction;

    const openTransactionDetails = useCallback(() => {
      onTxDetailsPress?.(transaction);
    }, [transaction, onTxDetailsPress]);

    const txDate = date ? moment(date).local().format?.("MM.DD.YYYY HH:mm") : "";
    const colorAmount = status === "failed" ? "goodRed.200" : "txGreen";
    const amountPrefix = status === "failed" ? "" : "+";

    // Get provider icon and color
    const getProviderIcon = () => {
      return bridgeProvider === "axelar" ? "A" : "L";
    };

    const getProviderColor = () => {
      return bridgeProvider === "axelar" ? "green.500" : "blue.500";
    };

    // Get status icon based on transaction status
    const getStatusIcon = () => {
      switch (status) {
        case "bridging":
          return (
            <Box w="34" h="34" borderRadius="full" bg="blue.400" alignItems="center" justifyContent="center">
              <Spinner size="xs" color="white" />
            </Box>
          );
        case "completed":
          return (
            <Box w="34" h="34" borderRadius="full" bg="green.400" alignItems="center" justifyContent="center">
              <Text fontSize="xs" color="white">
                ✓
              </Text>
            </Box>
          );
        case "failed":
          return (
            <Box w="34" h="34" borderRadius="full" bg="red.400" alignItems="center" justifyContent="center">
              <Text fontSize="xs" color="white">
                ✕
              </Text>
            </Box>
          );
        case "pending":
          return (
            <Box w="34" h="34" borderRadius="full" bg="yellow.400" alignItems="center" justifyContent="center">
              <Text fontSize="xs" color="white">
                ⏳
              </Text>
            </Box>
          );
        default:
          return null;
      }
    };

    const getStatusText = () => {
      switch (status) {
        case "bridging":
          return "Bridging in progress...";
        case "completed":
          return "Bridge completed";
        case "failed":
          return "Bridge failed";
        case "pending":
          return "Pending confirmation";
        default:
          return "";
      }
    };

    return (
      <Pressable
        onPress={openTransactionDetails}
        width="100%"
        marginBottom={2}
        {...Platform.select({ web: { marginBottom: 1 } })}
      >
        <VStack
          space={1}
          borderLeftWidth="10px"
          borderColor={colorAmount}
          backgroundColor="goodWhite.100"
          borderRadius="5"
          shadow="1"
          width="100%"
          justifyContent={"flex-start"}
        >
          <HStack justifyContent="space-between" space={2} paddingX={2} paddingY={1}>
            <Center>
              <Box w="6" h="6" borderRadius="full" bg={getProviderColor()} alignItems="center" justifyContent="center">
                <Text color="white" fontSize="xs" fontWeight="bold">
                  {getProviderIcon()}
                </Text>
              </Box>
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="center">
              <Text fontSize="4xs">{txDate}</Text>
              {amount ? (
                <Text color={colorAmount} fontSize="sm" fontWeight="semibold">
                  {amountPrefix}
                  {amount} G$
                </Text>
              ) : null}
            </HStack>
          </HStack>
          <HStack justifyContent="space-between" padding={2}>
            <Center>
              <Box w="8" h="8" borderRadius="full" bg="gray.300" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="gray.600">
                  ↔
                </Text>
              </Box>
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="flex-end">
              <VStack space={0} paddingLeft={2}>
                <Text variant="sm-grey" fontWeight="500">
                  Bridged via {bridgeProvider === "axelar" ? "Axelar" : "LayerZero"}
                </Text>
                <Text fontSize="4xs" fontFamily="subheading" fontWeight="400" lineHeight={12} color="goodGrey.600">
                  From {sourceChain} to {targetChain}
                </Text>
                {status !== "completed" && (
                  <Text fontSize="4xs" color={status === "failed" ? "red.500" : "blue.500"}>
                    {getStatusText()}
                  </Text>
                )}
              </VStack>
              <Center h={Platform.select({ web: "100%" })} justifyContent="center" alignItems="center">
                {getStatusIcon()}
              </Center>
            </HStack>
          </HStack>
        </VStack>
      </Pressable>
    );
  }
);

type BridgeTransactionListProps = {
  transactions: BridgeTransaction[] | undefined;
  onTxDetailsPress?: (transaction: BridgeTransaction) => void;
  limit?: number;
};

export const BridgeTransactionList = ({ transactions, onTxDetailsPress, limit = 3 }: BridgeTransactionListProps) => (
  <ScrollView
    style={{
      marginTop: 4,
      width: "100%",
      ...Platform.select({
        web: { scrollbarWidth: "thin", maxHeight: 550 },
        android: {
          height: limit < 3 ? "auto" : 300,
          maxHeight: limit < 3 ? "auto" : 300
        }
      })
    }}
    contentContainerStyle={{ flexGrow: 1, alignItems: "stretch", justifyContent: "center" }}
    showsVerticalScrollIndicator={true}
    scrollEnabled={true}
    persistentScrollbar={true}
    nestedScrollEnabled={true}
  >
    {transactions?.map((tx: BridgeTransaction) => (
      <BridgeTransactionCard key={tx.id ?? tx.transactionHash} {...{ transaction: tx, onTxDetailsPress }} />
    ))}
  </ScrollView>
);
