import React, { useEffect } from "react";
import { Center, Spinner, Text, VStack } from "native-base";
import { noop } from "lodash";

import type { CurrencyValue, TransactionStatus } from "@usedapp/core";
import { useTimer } from "@gooddollar/web3sdk-v2";

import { Title } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";

import type { ClaimStats, ClaimWizardProps } from "../types";

type PostClaimProps = {
  claimPools: { totalAmount: CurrencyValue; transactionList: any[] }; // <-- todo: define formatted transactionlsit type
  claimStats: Omit<ClaimStats, "claimCall">;
  claimStatus?: TransactionStatus;
  onClaim: ClaimWizardProps["onClaim"];
  onClaimFailed: (e?: any) => void;
};

const NextClaim = ({ time }: { time: Date }) => {
  const [nextClaim, , setClaimTime] = useTimer(time);

  useEffect(() => setClaimTime(time), [time.toString()]);

  return (
    <VStack space={0}>
      <Text textAlign="center" fontFamily="subheading" fontWeight="normal" fontSize="sm" color="white">
        {`Your Next Claim`}
      </Text>
      <Center backgroundColor="goodGrey.300">
        {" "}
        {/** <-- remove wrapping view, replace with blue-button design */}
        <Text textAlign="center" fontFamily="heading" fontWeight="700" fontSize="l" color="white">
          {nextClaim}
        </Text>
      </Center>
    </VStack>
  );
};

export const PostClaim = ({ claimPools, claimStats, claimStatus, onClaim, onClaimFailed }: PostClaimProps) => {
  const { transactionList } = claimPools ?? {};
  const { claimTime, isWhitelisted } = claimStats;
  const { status, errorMessage } = claimStatus ?? {};

  // temp: lint no-unused-vars
  console.log({ status, errorMessage, onClaimFailed, onClaim });

  if ((isWhitelisted as any) === undefined || transactionList?.length === 0 || transactionList === undefined)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack justifyContent="center" alignItems="center">
      <VStack space={2} marginBottom={8} borderBottomColor="goodGrey.300">
        <Title variant="title-gdblue" fontSize="xl">
          {`You've claimed today`}
        </Title>
        {claimTime ? <NextClaim time={claimTime} /> : null}
      </VStack>
      <VStack marginTop={8} space={4} width="375">
        <VStack width="375">
          <Title variant="title-gdblue" fontSize="l" width="100%">
            {`Recent claims (Last 30 days):`}
          </Title>
        </VStack>

        {transactionList?.length === 0 ? (
          <Spinner variant="page-loader" size="lg" />
        ) : (
          <TransactionList transactions={transactionList} onTxDetails={noop} />
        )}
      </VStack>
    </VStack>
  );
};
