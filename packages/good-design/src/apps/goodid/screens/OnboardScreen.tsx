import React from "react";
import { Container, Heading, HStack, Text, VStack, IContainerProps, Spinner } from "native-base";

import { withTheme } from "../../../theme";
import { TransTitle, TxModal } from "../../../core";
import { BaseButton } from "../../../core/buttons";
import { GoodIdCard } from "../components";
import SvgXml from "../../../core/images/SvgXml";
import DollarSvg from "../../../assets/svg/goodid/dollar.svg";
import GlobusSvg from "../../../assets/svg/goodid/globus.svg";
import HeartsSvg from "../../../assets/svg/goodid/hearts.svg";
import StopWatchSvg from "../../../assets/svg/goodid/stopwatch.svg";
import UbiSvg from "../../../assets/svg/goodid/ubi.svg";

export interface OnboardScreenProps {
  account: string;
  isPending: boolean;
  isWhitelisted?: boolean;
  certificateSubjects: any;
  expiryDate?: string;
  name?: string;
  onAccept: () => void;
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

//todo: define component style configuration
/**
 * OnboardScreen shown to all users who don't have good-id certificate yet
 * Certificates check should be done before and only show this screen when they don't exist
 * @param {string} account - user's account address
 * @param {function} onAccept - callback for alternative in-app navigation for the gooddollar wallet
 * @param {object} innerContainer - styles for the inner container
 * @param {object} fontStyles - styles for the text elements
 */
export const OnboardScreen = withTheme({ name: "OnboardScreen" })(
  ({
    account,
    isPending,
    isWhitelisted,
    certificateSubjects,
    expiryDate,
    onAccept,
    innerContainer,
    fontStyles,
    name,
    ...props
  }: OnboardScreenProps & IContainerProps) => {
    const { listLabel, poweredBy } = fontStyles ?? {};

    if (isWhitelisted === undefined) return <Spinner variant="page-loader" size="lg" />;

    const titleCopy = isWhitelisted
      ? /*i18n*/ "Renew your GoodID to claim UBI"
      : /*i18n*/ "Get your GoodID to claim UBI";
    return (
      <Container {...props}>
        <TxModal type="identity" isPending={isPending} />

        <VStack space="6" justifyContent="center" alignItems="center" width="100%">
          <TransTitle t={titleCopy} variant="title-gdblue" fontSize="xl" alignSelf="center" />

          <VStack {...innerContainer}>
            {account ? (
              <GoodIdCard
                {...{
                  isWhitelisted,
                  certificateSubjects,
                  account,
                  expiryDate
                }}
                fullname={name}
              />
            ) : null}

            <VStack space={2} w="100%">
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
              </VStack>
            </VStack>
          </VStack>

          <Text variant="browse-wrap" alignSelf={"center"}>
            {` By clicking on ”I accept, verify me”, you are accepting our Terms of Use and Privacy Policy. Per this policy you agree to let us collect information such as your gender and age.`}
          </Text>

          <VStack alignSelf={"center"}>
            <BaseButton onPress={onAccept} text="I ACCEPT, VERIFY ME" maxW={343} variant="standard-blue" />
            <Text {...poweredBy}>Powered by GoodDollar</Text>
          </VStack>
        </VStack>
      </Container>
    );
  }
);
