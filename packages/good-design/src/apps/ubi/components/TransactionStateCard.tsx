import React, { useCallback } from "react";
import { Center, HStack, Pressable, ScrollView, Text, VStack } from "native-base";
import { Platform } from "react-native";

import { withTheme } from "../../../theme/hoc";
import { Image } from "../../../core/images";
import { GdAmount, TransText } from "../../../core/layout";

import { ClaimContextProps, Transaction } from "../types";
import { isReceiveTransaction } from "../utils/transactionType";

import { getTxIcons } from "../../../utils/icons";

export type TransactionCardProps = {
  transaction: Transaction;
  onTxDetailsPress: ClaimContextProps["onTxDetailsPress"];
};

//todo: border likely needs to be turned into component because of pattern. border-image not supported in react-native
export const TransactionCard = withTheme({ name: "TransactionCard" })(
  ({ transaction, onTxDetailsPress }: TransactionCardProps) => {
    const { tokenValue, type, status, date, displayName } = transaction;

    const openTransactionDetails = useCallback(() => {
      onTxDetailsPress?.(transaction);
    }, [transaction, onTxDetailsPress]);

    const isClaimStart = type === "claim-start";

    const isReceive = isReceiveTransaction(transaction);
    const amountPrefix = isClaimStart ? "" : isReceive ? "+" : "-";
    const txDate = date ? date.local().format?.("MM.DD.YYYY HH:mm") : "";
    const colorAmount = isClaimStart ? null : isReceive ? "txGreen" : "goodRed.200";

    const { txIcon, networkIcon, contractIcon } = getTxIcons(transaction);

    return (
      <Pressable
        onPress={openTransactionDetails}
        marginLeft="auto"
        marginRight="auto"
        marginBottom={2}
        {...Platform.select({ web: { marginBottom: 1 } })}
      >
        <VStack
          space={1}
          borderLeftWidth="10px"
          borderColor={colorAmount ?? "goodGrey.650"}
          backgroundColor="goodWhite.100"
          borderRadius="5"
          shadow="1"
          width="343"
          justifyContent={"flex-start"}
        >
          <HStack justifyContent="space-between" space={2} paddingX={2} paddingY={1}>
            <Center>
              <Image source={networkIcon} w="6" h="6" accessibilityLabel="NetworkIcon" />
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="center">
              <Text fontSize="4xs">{txDate}</Text>
              {tokenValue ? (
                <GdAmount
                  amount={tokenValue}
                  options={{ prefix: amountPrefix }}
                  color={colorAmount}
                  withDefaultSuffix
                />
              ) : null}
            </HStack>
          </HStack>
          <HStack justifyContent="space-between" padding={2}>
            <Center>
              <Image source={contractIcon} w="8" h="8" accessibilityLabel="Test" />
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="flex-end">
              <VStack space={0} paddingLeft={2}>
                <Text variant="sm-grey" fontWeight="500">
                  {displayName}
                </Text>
                <TransText
                  t={/*i18n*/ "Your Daily Basic Income"}
                  fontSize="4xs"
                  fontFamily="subheading"
                  fontWeight="400"
                  lineHeight="12"
                  color="goodGrey.600"
                />
                {/* Todo: should read subtitle from pool details*/}
                {status === "failed" ? <Text>TransactionFailedDetails</Text> : null}
              </VStack>
              <Center h={Platform.select({ web: "100%" })} justifyContent="center" alignItems="center">
                {status !== "failed" ? <Image w="34" h="34" source={txIcon} /> : null}
              </Center>
            </HStack>
          </HStack>
        </VStack>
      </Pressable>
    );
  }
);

type TransactionListProps = {
  transactions: Transaction[] | undefined;
  onTxDetailsPress: ClaimContextProps["onTxDetailsPress"];
};

export const TransactionList = ({ transactions, onTxDetailsPress }: TransactionListProps) => (
  <ScrollView
    style={{
      marginTop: 4,
      ...Platform.select({
        web: { scrollbarWidth: "thin", maxHeight: 550 },
        android: { maxWidth: 360, margin: "auto", height: 300, maxHeight: 300 }
      })
    }}
    contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}
    showsVerticalScrollIndicator={true}
    scrollEnabled={true}
    persistentScrollbar={true}
    nestedScrollEnabled={true}
  >
    {transactions?.map((tx: Transaction, i: any) => (
      <TransactionCard key={i} {...{ transaction: tx, onTxDetailsPress }} />
    ))}
  </ScrollView>
);
