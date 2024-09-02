import React, { FC, useContext, useEffect } from "react";
import { Center, HStack, Spinner, Text, VStack } from "native-base";
import { NewsFeedContext, useTimer } from "@gooddollar/web3sdk-v2";

import { NewsFeed } from "../../newsfeed";
import { Image } from "../../../core/images";
import { TransText, TransTitle } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";
import { useClaimContext } from "../context";
import { GoodButton } from "../../../core/buttons";

import BillyHearts from "../../../assets/gifs/billy-hearts.gif";
import SwitchArrows from "../../../assets/svg/switch-arrows.svg";

const NextClaim = ({ time }: { time: Date }) => {
  const [nextClaim, , setClaimTime] = useTimer(time);

  useEffect(() => setClaimTime(time), [time.toString()]);

  return (
    <VStack alignItems="center">
      <Image source={BillyHearts} alt="billy-hearts" width="100" height="120" />
      <VStack space={0} backgroundColor="goodGrey.400" borderRadius="100" w="160" h="160" justifyContent="center">
        <TransText t={/*i18n*/ "Your Next Claim"} textAlign="center" variant="sm-white-normal" />
        <Text textAlign="center" fontFamily="heading" fontWeight="700" fontSize="l" color="white">
          {nextClaim}
        </Text>
      </VStack>
    </VStack>
  );
};

export const PostClaim: FC = () => {
  const { claimPools, claimDetails, claimedAlt, onNews, onTxDetails, switchChain } = useClaimContext();
  const { feed } = useContext(NewsFeedContext);
  const { transactionList } = claimPools ?? {};
  const { claimTime, isWhitelisted } = claimDetails;
  const { hasClaimed, altChain } = claimedAlt ?? {};

  if ((isWhitelisted as any) === undefined || transactionList === undefined)
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
        <TransTitle t={/*i18n*/ "You've claimed today"} variant="title-gdblue" fontSize="xl" />
        {claimTime ? <NextClaim time={claimTime} /> : null}
        {!hasClaimed ? (
          <Center>
            <GoodButton onPress={switchChain} flexDir="row">
              <HStack space={2} justifyContent="center" alignItems="center">
                <Image source={SwitchArrows} alt="switch-arrows" width="6" height="6" />
                <TransText
                  t={/*i18n*/ "CLAIM ON {altChain}"}
                  values={{ altChain: altChain }}
                  variant="sm-white-normal"
                />
              </HStack>
            </GoodButton>
          </Center>
        ) : null}
        <VStack space={6}>
          <Center width="375">
            <NewsFeed {...{ feed }} />
          </Center>
          <GoodButton variant="link-like" onPress={onNews}>
            <TransText
              t={/*i18n*/ "See all news >"}
              fontFamily="subheading"
              color="primary"
              fontSize="ms"
              fontWeight="700"
            />
          </GoodButton>
        </VStack>
      </VStack>
      <VStack marginTop={8} space={4} width="375">
        <VStack width="375">
          <TransTitle t={/*i18n*/ "Recent claims (Last 30 days):"} variant="title-gdblue" fontSize="l" width="100%" />
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
