import React, { useCallback, useEffect, useState } from "react";
import { Container, Heading, HStack, Text, VStack } from "native-base";
import { AsyncStorage, useIdentityExpiryDate, useIsAddressVerified } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import moment from "moment";

import { useFVModalAction } from "../../../hooks/useFVModalAction";
import { withTheme } from "../../../theme";
import { Title, TxModal } from "../../../core";
import { BaseButton } from "../../../core/buttons";
import { GoodIdCard } from "../idcard";
import SvgXml from "../../../core/images/SvgXml";
import DollarSvg from "../../../assets/svg/goodid/dollar.svg";
import GlobusSvg from "../../../assets/svg/goodid/globus.svg";
import HeartsSvg from "../../../assets/svg/goodid/hearts.svg";
import StopWatchSvg from "../../../assets/svg/goodid/stopwatch.svg";
import UbiSvg from "../../../assets/svg/goodid/ubi.svg";

interface OnboardScreenProps {
  account: string | undefined;
  firstName?: string | undefined;
  onFV?: () => void;
  onSkip: () => void;
  innerContainer?: any;
  fontStyles?: any;
}

const accessList = [
  {
    label: "Crypto UBI",
    icon: UbiSvg
  },
  {
    label: "Humanitarian funds",
    icon: HeartsSvg
  },
  {
    label: "Climate relief disbursements",
    icon: GlobusSvg
  },
  {
    label: "Financial services",
    icon: DollarSvg
  }
];

/**
 * OnboardScreen shown to all users who don't have good-id certificate yet
 * Certificates check should be done before and only show this screen when they don't exist
 * @param {string} account - user's account address
 * @param {function} navigateTo - callback for alternative in-app navigation for the gooddollar wallet
 * @param {object} innerContainer - styles for the inner container
 * @param {object} fontStyles - styles for the text elements
 */
const OnboardScreen = withTheme({ name: "OnboardScreen" })(
  ({ onFV, onSkip, account, firstName, innerContainer, fontStyles, ...props }: OnboardScreenProps) => {
    const [hasCertificates] = useState(false);
    const [isWhitelisted] = useIsAddressVerified(account ?? "");
    const [expiryDate] = useIdentityExpiryDate(account ?? "");
    const [isPending, setPendingSignTx] = useState(false);
    const { listLabel, poweredBy } = fontStyles ?? {};

    useEffect(() => {
      if (hasCertificates === true) {
        onSkip();
      }
    }, [hasCertificates]);

    const storeFvSig = async (fvSig: string) => {
      // the link will be requested to send a user to the fv-flow
      // we want to prevent a user to have to sign again when it redirects
      // so we store the fv-sig locally
      await AsyncStorage.setItem("fvsig", fvSig);
    };

    const { verify } = useFVModalAction({
      firstName: firstName ?? "",
      method: "redirect",
      chainId: 42220,
      onClose: noop,
      onFvSig: storeFvSig
    });

    const handleNext = async () => {
      // Should go to FaceVerificationIntro (wallet) || GoodID server (third parties)
      if (onFV) {
        onFV();
      } else {
        setPendingSignTx(true);
        await verify();
      }
    };

    const handleShouldFv = useCallback(async () => {
      const { expiryTimestamp } = expiryDate || {};

      // if someone is whitelisted we want to verify their timestamp
      // to determine if they should re-do the fv-flow
      if (isWhitelisted && expiryTimestamp) {
        const expiry = moment(expiryTimestamp.toNumber());
        const threeMonthsFromNow = moment().clone().add(3, "months");
        const isWithinThreeMonths = expiry.isBefore(threeMonthsFromNow);

        // if the expiry date is within 3 months, we should re-do the fv-flow
        if (isWithinThreeMonths) {
          void handleNext();
        } else {
          // if the expiry date is not within 3 months we will use their existing fv data
          // to run the good-id checks
          //todo: Need solution for widget-navigation (gooddapp): https://github.com/GoodDollar/GoodWeb3-Mono/issues/131
          // nextPage() <-- should navigate to segmentation screen
        }
        return;
      }

      void handleNext();
    }, [verify, isWhitelisted, expiryDate]);

    // todo: might want a spinner while waiting for isWhitelisted
    if (isWhitelisted === undefined || hasCertificates !== false) return <></>;

    return (
      <Container {...props}>
        <TxModal type="identity" isPending={isPending} />
        <VStack {...innerContainer}>
          <Title variant="title-gdblue" fontSize="xl">
            {isWhitelisted ? `Renew` : `Get`} your GoodID to claim UBI
          </Title>
          {account ? (
            <GoodIdCard
              isWhitelisted={isWhitelisted}
              account={account}
              expiryDate={expiryDate?.formattedExpiryTimestamp}
            />
          ) : null}

          <VStack space={2} alignItems="flex-start">
            <Heading fontSize="md" color="goodGrey.600">
              It unlocks access to:
            </Heading>
            {accessList.map(({ label, icon }, index) => (
              <HStack key={label} space={2}>
                <SvgXml
                  style={{ backgroundColor: "#00AFFF", borderRadius: "50%", padding: 4 }}
                  key={index}
                  src={icon}
                  width="16"
                  height="16"
                  enableBackground="true"
                />
                <Text {...listLabel}>{label}</Text>
              </HStack>
            ))}
            <VStack space={10}>
              <HStack space={2} marginTop={2}>
                <SvgXml src={StopWatchSvg} width="20" height="20" />
                <Text fontFamily="subheading" fontSize="sm" color="primary">
                  Verification takes 2 minutes
                </Text>
              </HStack>
              <Text variant="browse-wrap">
                By clicking on ”I accept, verify me”, you are accepting our Terms of Use and Privacy Policy. Per this
                policy you agree to let us collect information such as your gender and age.
              </Text>
            </VStack>
            <VStack space={4}>
              <BaseButton onPress={handleShouldFv} text="I ACCEPT, VERIFY ME" maxW={343} variant="standard-blue" />
              <Text {...poweredBy}>Powered by GoodDollar</Text>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    );
  }
);

export default OnboardScreen;
