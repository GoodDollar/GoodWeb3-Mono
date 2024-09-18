import React, { FC, useContext, useEffect } from "react";
import { Center, HStack, Spinner, Text, VStack } from "native-base";
import { NewsFeedContext, useTimer } from "@gooddollar/web3sdk-v2";
import moment from "moment";
import { isEmpty } from "lodash";

import { NewsFeed } from "../../newsfeed";
import { Image } from "../../../core/images";
import { TransText, TransTitle } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";
import { useClaimContext } from "../context";
import { GoodButton } from "../../../core/buttons";

import BillyHearts from "../../../assets/gifs/billy-hearts.gif";
import SwitchArrows from "../../../assets/svg/switch-arrows.svg";

const getEarliestClaimTime = (times: Date[], claimTime: Date) => {
  const allTimes = [...times, claimTime];
  const earliestTime = allTimes.reduce((prev, curr) => (prev < curr ? prev : curr));

  return moment(earliestTime).toDate();
};

const NextClaim = ({
  poolTimes,
  claimTime,
  onReset
}: {
  poolTimes: Date[] | undefined;
  claimTime: Date;
  onReset?: () => void;
}) => {
  const [earliestNextTime, setEarliestTime] = React.useState<Date | undefined>(undefined);
  const [nextClaim, , setClaimTime] = useTimer(earliestNextTime);

  useEffect(() => {
    if (earliestNextTime) {
      const earliestMoment = moment(earliestNextTime);

      if (earliestMoment.isBefore(moment())) {
        onReset?.();
      }
    }

    const nextClaim = poolTimes && !isEmpty(poolTimes) ? getEarliestClaimTime(poolTimes, claimTime) : claimTime;

    setEarliestTime(nextClaim);
  }, [poolTimes, claimTime]);

  useEffect(() => setClaimTime(earliestNextTime), [earliestNextTime?.toString()]);

  return (
    <VStack alignItems="center">
      {nextClaim ? (
        <>
          <Image source={BillyHearts} alt="billy-hearts" width="100" height="120" />
          <VStack space={0} backgroundColor="goodGrey.400" borderRadius="100" w="160" h="160" justifyContent="center">
            <TransText t={/*i18n*/ "Your Next Claim"} textAlign="center" variant="sm-white-normal" />

            <Text textAlign="center" fontFamily="heading" fontWeight="700" fontSize="l" color="white">
              {nextClaim}
            </Text>
          </VStack>
        </>
      ) : (
        <Spinner variant="page-loader" size="lg" />
      )}
    </VStack>
  );
};

export const PostClaim: FC = () => {
  const {
    claimPools,
    claimDetails,
    claimedAlt,
    poolsDetails,
    withNewsFeed,
    onNews,
    onReset,
    onTxDetailsPress,
    switchChain
  } = useClaimContext();
  const { feed } = useContext(NewsFeedContext);
  const { transactionList } = claimPools ?? {};

  const { hasClaimed, altChain } = claimedAlt ?? {};

  const { claimTime, isWhitelisted } = claimDetails;
  const poolTimes: Date[] | undefined = poolsDetails?.map(obj => Object.values(obj)[0].claimTime);

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
        {poolTimes || claimTime ? <NextClaim {...{ claimTime, onReset, poolTimes }} /> : null}
        {!hasClaimed ? (
          <Center>
            <GoodButton onPress={() => switchChain(altChain)} flexDir="row">
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
        {withNewsFeed ? (
          <VStack space={6}>
            <Center width="375">
              <NewsFeed direction="column" {...{ feed }} />
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
        ) : null}
      </VStack>
      <VStack mt={8} mb={8} space={4} width="375">
        <VStack width="375">
          <TransTitle t={/*i18n*/ "Recent claims (Last 30 days):"} variant="title-gdblue" fontSize="l" width="100%" />
        </VStack>

        {transactionList === undefined ? (
          <Spinner variant="page-loader" size="lg" />
        ) : (
          <TransactionList transactions={transactionList} onTxDetailsPress={onTxDetailsPress} />
        )}
      </VStack>
    </VStack>
  );
};