import React from "react";
import { Center, HStack, Text, VStack } from "native-base";

import { withTheme } from "../../../theme/hoc";
import { BasePressable } from "../../../core/buttons";
import { Image } from "../../../core/images";
import { GdAmount } from "../../../core/layout";

import { ClaimWizardProps, Transaction } from "../types";
import { isReceiveTransaction } from "../utils/transactionType";

import ClaimGreenIcon from "../../../assets/images/claim-green.png";
import ClaimGreyIcon from "../../../assets/images/claim-grey.png";
import PendingIcon from "../../../assets/images/pending-icon.png";

const TransactionStateIcons = {
  "claim-start": ClaimGreyIcon,
  "claim-confirmed": ClaimGreenIcon,
  pending: PendingIcon
  // receive: "ReceiveIcon", // red
  // send: "sendIcon" // green
};

export type TransactionCardProps = {
  transaction: any; //<-- should be type of FormattedTransaction
  onTxDetails: ClaimWizardProps["onTxDetails"];
};

//todo: border needs to indicate state of transaction by color
//todo: border likely needs to be turned into component because of pattern. border-image not supported in react-native
export const TransactionCard = withTheme({ name: "TransactionCard" })(
  ({ transaction, onTxDetails }: TransactionCardProps) => {
    const { tokenValue, type, status, date, displayName } = transaction;
    const openTransactionDetails = () => {
      onTxDetails(transaction);
    };

    const icon = TransactionStateIcons[status === "pending" ? "pending" : (type as keyof typeof TransactionStateIcons)];
    const amountPrefix = isReceiveTransaction(transaction) ? "+" : "-";
    const txDate = date ?? "";

    return (
      <BasePressable onPress={openTransactionDetails} width="100%">
        <VStack
          space={0}
          borderLeftWidth="10px"
          borderColor="goodGrey.600"
          backgroundColor="goodWhite.100"
          borderRadius="5"
          shadow="1"
          width="100%"
        >
          <HStack justifyContent="space-between" space={22} paddingX={2} paddingY={1}>
            <Center>
              <Image w="5" h="5" accessibilityLabel="Test" borderWidth={1} />
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="flex-end">
              <Text fontSize="4xs">{txDate}</Text>
              <GdAmount amount={tokenValue} options={{ prefix: amountPrefix }} color="txGreen" />
            </HStack>
          </HStack>
          <HStack justifyContent="space-between" padding={2} space={22} backgroundColor="white">
            <Center>
              <Image w="5" h="5" accessibilityLabel="Test" borderWidth={1} />
            </Center>
            <HStack flexShrink={1} justifyContent="space-between" width="100%" alignItems="flex-end">
              <VStack space={0}>
                <Text variant="sm-grey" fontWeight="500">
                  {displayName}
                </Text>
                <Text
                  fontSize="4xs"
                  fontFamily="subheading"
                  fontWeight="400"
                  lineHeight="12"
                  color="goodGrey.600"
                >{`Your Daily Basic Income`}</Text>
                {status === "failed" ? <Text>TransactionFailedDetails</Text> : null}
              </VStack>
              <Center h="100%" justifyContent="center" alignItems="center" justifyItems="center">
                {status !== "failed" ? <Image w="34" h="34" source={icon} /> : null}
              </Center>
            </HStack>
          </HStack>
        </VStack>
      </BasePressable>
    );
  }
);

type TransactionListProps = {
  transactions: Transaction[];
  onTxDetails: ClaimWizardProps["onTxDetails"];
};

export const TransactionList = ({ transactions, onTxDetails }: TransactionListProps) => (
  <VStack>
    {transactions.map((tx: Transaction, i: any) => (
      <TransactionCard key={i} {...{ transaction: tx, onTxDetails }} />
    ))}
  </VStack>
);
