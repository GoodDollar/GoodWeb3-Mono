import React from "react";
import { Container, HStack, Text, VStack, IContainerProps, Spinner, Link, View } from "native-base";
import type { CredentialSubjectsByType } from "@gooddollar/web3sdk-v2";

import { withTheme } from "../../../theme/hoc/withTheme";

import { openLink } from "@gooddollar/web3sdk-v2";
import { TransButton, TransHeading, TransText, TransTitle } from "../../../core/layout";
import { TxModal } from "../../../core/web3/modals";
import { BasePressable } from "../../../core/buttons";

import { GoodIdCard } from "../components";
import { Image } from "../../../core/images";
import DollarIcon from "../../../assets/images/goodid/dollar2.png";
import GlobusIcon from "../../../assets/images/goodid/globus.png";
import HeartsIcon from "../../../assets/images/goodid/hearts.png";
import StopWatchIcon from "../../../assets/images/goodid/stopwatch.png";
import InfoIcon from "../../../assets/images/goodid/info.png";
import UbiIcon from "../../../assets/images/goodid/ubi.png";

export interface OnboardScreenProps {
  account: string;
  isPending: boolean;
  isWhitelisted?: boolean;
  certificateSubjects: CredentialSubjectsByType;
  expiryDate?: string;
  name?: string;
  onAccept: () => void;
  innerContainer?: any;
  fontStyles?: any;
}

const accessList = [
  {
    label: /*i18n*/ { id: "Crypto UBI", comment: "GoodID feature access list" },
    icon: UbiIcon
  },
  {
    label: /*i18n*/ { id: "Humanitarian funds", comment: "GoodID feature access list" },
    icon: HeartsIcon
  },
  {
    label: /*i18n*/ { id: "Climate relief disbursements", comment: "GoodID feature access list" },
    icon: GlobusIcon
  },
  {
    label: /*i18n*/ { id: "Financial services", comment: "GoodID feature access list" },
    icon: DollarIcon
  }
];

// const ImageTest = (props: any) => <Image {...props} />;

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

        <VStack space="6" padding={1} justifyContent="center" alignItems="center" width="100%">
          <TransTitle t={titleCopy} variant="title-gdblue" fontSize="xl" alignSelf="center" padding={1} />

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
              <TransHeading t={/*i18n*/ "It unlocks access to:"} fontSize="md" color="goodGrey.600" />
              {accessList.map(({ label, icon }, index) => (
                <HStack key={label.id} space={2}>
                  <View width="6" height="6" backgroundColor="gdPrimary" borderRadius="50">
                    <Image key={index} source={icon} w="4" h="4" margin="auto" resizeMode="center" />
                  </View>

                  <TransText t={label.id} {...listLabel} />
                </HStack>
              ))}
              <VStack space={10}>
                <VStack space={4}>
                  <HStack space={2} marginTop={2}>
                    <Image source={StopWatchIcon} width="5" height="5" />
                    <TransText
                      t={/*i18n*/ "Verification takes 2 minutes"}
                      fontFamily="subheading"
                      fontSize="sm"
                      color="gdPrimary"
                    />
                  </HStack>
                  <HStack space={2}>
                    <Image source={InfoIcon} width="5" height="5" />
                    <TransText
                      t={
                        /*i18n*/ "Your GoodID lives in your local storage. If you use other devices, browsers or browser sessions to access GoodDollar, you will be asked to upgrade again."
                      }
                      fontFamily="subheading"
                      fontSize="sm"
                      color="goodGrey.400"
                      width={343}
                    />
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          </VStack>

          <TransText
            variant="browse-wrap"
            alignSelf={"center"}
            t={
              /*i18n*/ "By clicking on ”I accept, verify me”, you are accepting our {tos} and {privy}. Per this policy you agree to let us collect information such as your gender and age."
            }
            values={{
              tos: (
                <Link href="https://www.gooddollar.org/terms-of-use">
                  <Text
                    style={{
                      fontFamily: "Roboto",
                      fontSize: 12,
                      color: "#7A88A5",
                      textDecorationLine: "underline"
                    }}
                  >
                    Terms of Use
                  </Text>
                </Link>
              ),
              privy: (
                <Link href="https://www.gooddollar.org/privacy-policy">
                  <Text
                    style={{
                      fontFamily: "Roboto",
                      fontSize: 12,
                      color: "#7A88A5",
                      textDecorationLine: "underline"
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Link>
              )
            }}
          />

          <VStack alignItems="center" space={4} width="100%">
            <TransButton t={/*i18n*/ "I ACCEPT, VERIFY ME"} onPress={onAccept} maxW={"343"} width="100%" />
            <BasePressable onPress={() => openLink("https://gooddollar.org/", "_blank")}>
              <TransText t={/*i18n*/ "Powered by GoodDollar"} {...poweredBy} />
            </BasePressable>
          </VStack>
        </VStack>
      </Container>
    );
  }
);
