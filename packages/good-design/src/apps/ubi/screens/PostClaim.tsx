import React, { FC, useEffect } from "react";
import { Center, Spinner, Text, VStack } from "native-base";
import { isEmpty } from "lodash";
import { useTimer } from "@gooddollar/web3sdk-v2";

import { Image } from "../../../core/images";
import { Title } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";
import { useClaimContext } from "../context";
import { GoodButton } from "../../../core";

import BillyHearts from "../../../assets/gifs/billy-hearts.gif";

const NextClaim = ({ time }: { time: Date }) => {
  const [nextClaim, , setClaimTime] = useTimer(time);

  useEffect(() => setClaimTime(time), [time.toString()]);

  return (
    <VStack alignItems="center">
      <Image source={BillyHearts} alt="billy-hearts" width="100" height="120" />
      <VStack space={0} backgroundColor="goodGrey.400" borderRadius="100" w="160" h="160" justifyContent="center">
        <Text textAlign="center" fontFamily="subheading" fontWeight="normal" fontSize="sm" color="white">
          {`Your Next Claim`}
        </Text>
        <Text textAlign="center" fontFamily="heading" fontWeight="700" fontSize="l" color="white">
          {nextClaim}
        </Text>
      </VStack>
    </VStack>
  );
};

export const PostClaim: FC = () => {
  const {
    claimPools,
    claimDetails,
    // claimStatus,
    claimedAlt,
    // onClaim,
    // onClaimFailed,
    onTxDetails,
    switchChain
  } = useClaimContext();
  const { transactionList } = claimPools ?? {};
  const { claimTime, isWhitelisted } = claimDetails;
  // const { status, errorMessage } = claimStatus ?? {};
  const { hasClaimed, altChain } = claimedAlt ?? {};

  // temp: lint no-unused-vars
  // // console.log({ status, errorMessage, onClaimFailed, onClaim });

  if ((isWhitelisted as any) === undefined || isEmpty(transactionList) || hasClaimed === undefined)
    return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack justifyContent="center" alignItems="center">
      <VStack
        width="100%"
        space={8}
        paddingBottom={8}
        borderBottomWidth={1}
        borderBottomColor="goodGrey.300"
        alignItems="center"
      >
        <Title variant="title-gdblue" fontSize="xl">
          {`You've claimed today`}
        </Title>
        {claimTime ? <NextClaim time={claimTime} /> : null}
        {!hasClaimed ? (
          <Center>
            <GoodButton onPress={switchChain}>{`CLAIM ON ${altChain}`}</GoodButton>
          </Center>
        ) : null}
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
          <TransactionList transactions={transactionList} onTxDetails={onTxDetails} />
        )}
      </VStack>
    </VStack>
  );
};
