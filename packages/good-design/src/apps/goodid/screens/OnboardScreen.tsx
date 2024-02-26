import React, { useCallback, useEffect } from "react";
import { Container, Heading, HStack, Text, VStack } from "native-base";
import { useIdentityExpiryDate, useIsAddressVerified } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import moment from "moment";

import { useFVModalAction } from "../../../hooks/useFVModalAction";

import { withTheme } from "../../../theme";
import { Title } from "../../../core";
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
  navigateTo?: () => void;
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

const OnboardScreen = withTheme({ name: "OnboardScreen" })(({ navigateTo, account }: OnboardScreenProps) => {
  const [isWhitelisted] = useIsAddressVerified(account ?? "");
  const [expiryDate] = useIdentityExpiryDate(account ?? "");
  const [formattedExpiryDate, setExpiryDate] = React.useState<string | undefined>();

  // todo: might be moved to be implemented by external
  const { verify } = useFVModalAction({
    firstName: "Test", //todo: is this value required or can it be made optional?
    method: "redirect",
    chainId: 42220,
    onClose: noop
  });

  const handleShouldFv = useCallback(async () => {
    const { expiryTimestamp } = expiryDate || {};

    if (isWhitelisted && expiryTimestamp) {
      const expiry = moment(expiryTimestamp.toNumber());
      const threeMonthsFromNow = moment().clone().add(3, "months");
      const isWithinThreeMonths = expiry.isBefore(threeMonthsFromNow);

      if (isWithinThreeMonths) {
        navigateTo ? navigateTo() : await verify();
      } else {
        //todo: Need solution for widget-navigation (gooddapp)
        // nextPage() <-- should navigate to segmentation screen
      }
      return;
    }

    // Should go to FaceVerificationIntro (wallet) || GoodID server (third parties)
    // todo/gooddapp: add modal for sign request
    navigateTo ? navigateTo() : await verify();
  }, [verify]);

  useEffect(() => {
    const { expiryTimestamp } = expiryDate || {};

    if (isWhitelisted && expiryTimestamp) {
      const timestamp = expiryTimestamp.toNumber();
      const formattedDate = moment(timestamp).format("MMMM DD, YYYY");

      setExpiryDate(formattedDate);
    }
  }, [isWhitelisted, expiryDate]);

  // todo: might want a spinner while waiting for isWhitelisted
  if (isWhitelisted === undefined) return <></>;

  return (
    <Container width={375} paddingX={4} alignItems="center" maxWidth="100%">
      <VStack space={8} maxWidth={"100%"} alignItems="center">
        <Title fontSize="xl" lineHeight="30" textAlign="center">
          {isWhitelisted ? `Renew` : `Get`} your GoodID to claim UBI
        </Title>
        <GoodIdCard credentialsList={[]} account={account} expiryDate={formattedExpiryDate} />
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
              <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
                {label}
              </Text>
            </HStack>
          ))}
          <VStack space={10}>
            <HStack space={2} marginTop={2}>
              <SvgXml src={StopWatchSvg} width="20" height="20" />
              <Text fontFamily="subheading" fontSize="sm" color="primary">
                Verification takes 2 minutes
              </Text>
            </HStack>
            <Text fontFamily="subheading" color="goodGrey.450" fontSize="2xs" textAlign="center">
              By clicking on ”I accept, verify me”, you are accepting our Terms of Use and Privacy Policy. Per this
              policy you agree to let us collect information such as your gender and age.
            </Text>
          </VStack>
          <VStack space={4}>
            <BaseButton
              onPress={handleShouldFv}
              text="I ACCEPT, VERIFY ME"
              maxW={343}
              innerView={{
                backgroundColor: "primary",
                paddingX: 8,
                paddingY: "10px",
                borderRadius: 24,
                width: 343,
                textAlign: "center"
              }}
              innerText={{ fontFamily: "subheading", fontSize: "sm", fontWeight: "bold" }}
            />
            <Text underline={true} textAlign="center" fontSize="2xs">
              Powered by GoodDollar
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
});

export default OnboardScreen;
