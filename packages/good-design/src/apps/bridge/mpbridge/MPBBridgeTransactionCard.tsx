import React, { useCallback, useMemo } from "react";
import { Center, HStack, Pressable, ScrollView, Text, VStack, Box, Spinner } from "native-base";
import { Platform } from "react-native";
import moment from "moment";

import { withTheme } from "../../../theme/hoc";
import { Image } from "../../../core/images";
import { networkIcons } from "../../../utils/icons";

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
    const colorAmount = status === "failed" ? "goodRed.500" : "txGreen";
    const amountPrefix = status === "failed" ? "" : "+";

    const sourceChainIcon = useMemo(() => {
      const chainKey = sourceChain.toUpperCase() as keyof typeof networkIcons;
      return networkIcons[chainKey];
    }, [sourceChain]);

    const targetChainIcon = useMemo(() => {
      const chainKey = targetChain.toUpperCase() as keyof typeof networkIcons;
      return networkIcons[chainKey];
    }, [targetChain]);

    const getChainInitial = (chain: string) => {
      return chain.charAt(0).toUpperCase();
    };

    const providerLabel = bridgeProvider === "axelar" ? "Axelar" : "LayerZero";
    const providerColor = bridgeProvider === "axelar" ? "goodBlue.600" : "goodBlue.500";

    const getStatusIcon = () => {
      switch (status) {
        case "bridging":
          return (
            <Box
              w="8"
              h="8"
              borderRadius="full"
              bg="goodBlue.100"
              borderWidth="2"
              borderColor="goodBlue.500"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner size="xs" color="goodBlue.600" />
            </Box>
          );
        case "completed":
          return (
            <Box w="8" h="8" borderRadius="full" bg="txGreen" alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="white" fontWeight="bold">
                ✓
              </Text>
            </Box>
          );
        case "failed":
          return (
            <Box w="8" h="8" borderRadius="full" bg="goodRed.500" alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="white" fontWeight="bold">
                ✕
              </Text>
            </Box>
          );
        case "pending":
          return (
            <Box w="8" h="8" borderRadius="full" bg="goodGrey.300" alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="goodGrey.700">
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
          borderLeftWidth="3px"
          borderLeftColor={colorAmount}
          backgroundColor="white"
          borderRadius="lg"
          borderWidth="1"
          borderColor="goodGrey.200"
          shadow="sm"
          width="100%"
          justifyContent="flex-start"
        >
          <HStack justifyContent="space-between" space={3} paddingX={3} paddingY={2}>
            <HStack space={2} alignItems="center" flex={1}>
              <Box px={2} py={1} borderRadius="md" bg={providerColor} alignItems="center" justifyContent="center">
                <Text color="black" fontSize="2xs" fontWeight="bold" letterSpacing="0.5px">
                  Bridged via {providerLabel}
                </Text>
              </Box>
              <Text fontSize="2xs" color="goodGrey.500" flex={1}>
                {txDate}
              </Text>
            </HStack>
            {amount && (
              <Text color={colorAmount} fontSize="sm" fontWeight="700">
                {amountPrefix}
                {amount} G$
              </Text>
            )}
          </HStack>
          <HStack justifyContent="space-between" paddingX={3} paddingBottom={3} alignItems="center">
            <HStack space={2} alignItems="center" flex={1}>
              {sourceChainIcon ? (
                <Box w="6" h="6" borderRadius="full" overflow="hidden" borderWidth="1" borderColor="goodGrey.200">
                  <Image source={sourceChainIcon} w="6" h="6" resizeMode="cover" />
                </Box>
              ) : (
                <Box
                  w="6"
                  h="6"
                  borderRadius="full"
                  bg="goodGrey.300"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="1"
                  borderColor="goodGrey.200"
                >
                  <Text fontSize="2xs" color="goodGrey.700" fontWeight="bold">
                    {getChainInitial(sourceChain)}
                  </Text>
                </Box>
              )}
              <Box w="4" h="4" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="goodGrey.400" fontWeight="bold">
                  →
                </Text>
              </Box>
              {targetChainIcon ? (
                <Box w="6" h="6" borderRadius="full" overflow="hidden" borderWidth="1" borderColor="goodGrey.200">
                  <Image source={targetChainIcon} w="6" h="6" resizeMode="cover" />
                </Box>
              ) : (
                <Box
                  w="6"
                  h="6"
                  borderRadius="full"
                  bg="goodGrey.300"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="1"
                  borderColor="goodGrey.200"
                >
                  <Text fontSize="2xs" color="goodGrey.700" fontWeight="bold">
                    {getChainInitial(targetChain)}
                  </Text>
                </Box>
              )}
              <VStack space={0.5} paddingLeft={2} flex={1}>
                <Text fontSize="xs" fontFamily="subheading" fontWeight="500" color="goodGrey.700">
                  {sourceChain.charAt(0).toUpperCase() + sourceChain.slice(1)} →{" "}
                  {targetChain.charAt(0).toUpperCase() + targetChain.slice(1)}
                </Text>
                {status !== "completed" && (
                  <Text fontSize="2xs" color={status === "failed" ? "goodRed.500" : "goodBlue.600"}>
                    {getStatusText()}
                  </Text>
                )}
              </VStack>
            </HStack>
            <Center>{getStatusIcon()}</Center>
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
