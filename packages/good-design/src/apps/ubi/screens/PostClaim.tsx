import React, { FC, useContext, useEffect } from "react";
import { Center, HStack, Spinner, Text, VStack } from "native-base";
import { NewsFeedContext, useTimer } from "@gooddollar/web3sdk-v2";
import moment from "moment";
import { isEmpty } from "lodash";
import { useWizard } from "react-use-wizard";
import { Platform } from "react-native";

import { NewsFeed } from "../../newsfeed";
import { Image } from "../../../core/images";
import { TransText, TransTitle } from "../../../core/layout";
import { TransactionList } from "../components/TransactionStateCard";
import { useClaimContext } from "../context";
import { GoodButton } from "../../../core/buttons";

import BillyHearts from "../../../assets/gifs/billy-hearts.gif";
import SwitchArrows from "../../../assets/images/goodid/switch-arrows.png";

const getEarliestClaimTime = (times: Date[], claimTime: Date) => {
  const allTimes = [...times, claimTime];
  const earliestTime = allTimes.reduce((prev, curr) => (prev < curr ? prev : curr));

  return moment(earliestTime).toDate();
};

const NextClaim = ({
  poolTimes,
  nextClaimTime,
  onReset
}: {
  poolTimes: Date[] | undefined;
  nextClaimTime: Date;
  onReset?: () => void;
}) => {
  const { goToStep } = useWizard();
  const [earliestNextTime, setEarliestTime] = React.useState<Date | undefined>(undefined);
  const [nextClaim, , setClaimTime] = useTimer(earliestNextTime);

  useEffect(() => {
    if (earliestNextTime) {
      const earliestMoment = moment(earliestNextTime);

      if (earliestMoment.isBefore(moment())) {
        onReset?.();
        goToStep(2);
      }
    }

    const nextClaim = poolTimes && !isEmpty(poolTimes) ? getEarliestClaimTime(poolTimes, nextClaimTime) : nextClaimTime;

    setEarliestTime(nextClaim);
  }, [poolTimes, nextClaimTime]);

  useEffect(() => setClaimTime(earliestNextTime), [earliestNextTime?.toString()]);

  return (
    <VStack alignItems="center">
      {nextClaim ? (
        <>
          {Platform.OS === "web" ? <Image source={BillyHearts} alt="billy-hearts" width="100" height="120" /> : null}

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

  const { nextClaimTime, isWhitelisted } = claimDetails;
  const poolTimes: Date[] | undefined = poolsDetails?.map(pool => pool.nextClaimTime);

  if ((isWhitelisted as any) === undefined) return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack justifyContent="center" alignItems="center" mb={6}>
      <VStack
        width="100%"
        space={8}
        paddingBottom={8}
        borderBottomWidth={1}
        borderBottomColor="goodGrey.300"
        alignItems="center"
      >
        <TransTitle t={/*i18n*/ "You've claimed today"} variant="title-gdblue" fontSize="xl" />
        {poolTimes || nextClaimTime ? <NextClaim {...{ nextClaimTime, onReset, poolTimes }} /> : null}
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
      <VStack
        mt={2}
        mb={2}
        margin="auto"
        {...Platform.select({
          web: { width: 375 }
        })}
      >
        <VStack width="375" mb={2}>
          <TransTitle t={/*i18n*/ "Recent claims (Last 30 days):"} variant="title-gdblue" fontSize="l" width="100%" />
        </VStack>

        {transactionList === undefined ? (
          <Spinner variant="page-loader" size="lg" mt={2} />
        ) : transactionList.length === 0 ? (
          <VStack>
            <TransText
              my={6}
              t={/*i18n*/ "Unable to load your recent claims, try again later"}
              variant="browse-wrap"
              fontSize="sm"
            />
          </VStack>
        ) : (
          <TransactionList transactions={transactionList} onTxDetailsPress={onTxDetailsPress} />
        )}
      </VStack>
    </VStack>
  );
};
