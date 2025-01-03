import React from "react";
import { Center, Container, HStack, Text, VStack, IContainerProps, Spinner, Link, View } from "native-base";

import { withTheme } from "../../../theme/hoc/withTheme";

import { openLink } from "@gooddollar/web3sdk-v2";
import { TransButton, TransHeading, TransText, TransTitle } from "../../../core/layout";
import { TxModal } from "../../../core/web3/modals";
import { BasePressable } from "../../../core/buttons";

import { Image } from "../../../core/images";
import BillyWelcome from "../../../assets/images/goodid/billywelcome.png";
import HeartsIcon from "../../../assets/images/goodid/hearts.png";
import InfoIcon from "../../../assets/images/goodid/info.png";
import UbiIcon from "../../../assets/images/goodid/ubi.png";

export interface OnboardScreenProps {
  isPending: boolean;
  isWhitelisted?: boolean;
  expiryDate?: string;
  onAccept: () => void;
  innerContainer?: any;
  fontStyles?: any;
}

const accessListSimple = [
  {
    label: /*i18n*/ { id: "Crypto UBI", comment: "GoodID feature access list" },
    icon: UbiIcon
  },
  {
    label: /*i18n*/ { id: "Special Offers", comment: "GoodID feature access list" },
    icon: HeartsIcon
  }
];

//todo: define component style configuration
/**
 * OnboardScreen shown to all users who don't have good-id certificate yet
 * Certificates check should be done before and only show this screen when they don't exist

 * @param {function} onAccept - callback for alternative in-app navigation for the gooddollar wallet
 * @param {object} innerContainer - styles for the inner container
 * @param {object} fontStyles - styles for the text elements
 */
export const OnboardScreenSimple = withTheme({ name: "OnboardScreen" })(
  ({
    isPending,
    isWhitelisted,
    onAccept,
    innerContainer,
    fontStyles,
    ...props
  }: OnboardScreenProps & IContainerProps) => {
    const { listLabel, poweredBy } = fontStyles ?? {};

    if (isWhitelisted === undefined) return <Spinner variant="page-loader" size="lg" />;

    const titleCopy = isWhitelisted
      ? /*i18n*/ "Renew your GoodID to claim UBI"
      : /*i18n*/ "Get your GoodID to claim UBI";

    const actionCopy = isWhitelisted ? /*i18n*/ "I Accept, Renew & Claim" : /*i18n*/ "I Accept, Verify & Claim";

    return (
      <Container {...props}>
        <TxModal type="identity" isPending={isPending} />

        <VStack space="6" padding={1} justifyContent="center" alignItems="center" width="100%">
          <TransTitle t={titleCopy} variant="title-gdblue" fontSize="xl" alignSelf="center" padding={1} />
          <VStack {...innerContainer}>
            <Center>
              <Image w="115" h="115" source={BillyWelcome} style={{ resizeMode: "contain" }} />
            </Center>
            <VStack space={2} w="100%">
              <TransHeading t={/*i18n*/ "Your GoodID unlocks access to:"} fontSize="md" color="goodGrey.600" />
              {accessListSimple.map(({ label, icon }, index) => (
                <HStack key={label.id} space={2}>
                  <View width="6" height="6" backgroundColor="gdPrimary" borderRadius="50">
                    <Image key={index} source={icon} w="4" h="4" margin="auto" resizeMode="center" />
                  </View>

                  <TransText t={label.id} {...listLabel} />
                </HStack>
              ))}
              <VStack space={10}>
                <VStack space={4}>
                  <HStack space={2}>
                    <Image source={InfoIcon} width="5" height="5" />
                    <TransText
                      t={/*i18n*/ "Your privacy is preserved."}
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
              /*i18n*/ "By clicking on ”{actionCopy}”, you are accepting our {tos} and {privy}. Per this policy you agree to let us collect information such as your gender and age."
            }
            values={{
              actionCopy: actionCopy,
              tos: (
                <Link href="https://www.gooddollar.org/terms-of-use" isExternal>
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
                <Link href="https://www.gooddollar.org/privacy-policy" isExternal>
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
            <TransButton t={actionCopy} onPress={onAccept} maxW={"343"} width="100%" />
            <BasePressable onPress={() => openLink("https://gooddollar.org/", "_blank")}>
              <TransText t={/*i18n*/ "Powered by GoodDollar"} {...poweredBy} />
            </BasePressable>
          </VStack>
        </VStack>
      </Container>
    );
  }
);
