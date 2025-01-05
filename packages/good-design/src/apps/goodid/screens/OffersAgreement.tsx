import React from "react";
import { Center, Link, Text, View, VStack } from "native-base";
import type { InterfaceViewProps } from "native-base/lib/typescript/components/basic/View/types";

import { useWizard } from "react-use-wizard";
import { AsyncStorage } from "@gooddollar/web3sdk-v2";

import { TransButton, TransText, TransTitle } from "../../../core/layout";
import { Image } from "../../../core/images";

import BillyGrin from "../../../assets/images/billy-grin.png";
import { withTheme } from "../../../theme/hoc/withTheme";
import { Platform } from "react-native";

export const OffersAgreement = withTheme({ name: "OffersAgreement" })(
  ({
    styles,
    ...props
  }: InterfaceViewProps & { styles?: any; onDataPermission: (accepted: string) => Promise<void> }) => {
    const { nextStep } = useWizard();
    const { buttonContainer, image } = styles ?? {};
    const resizeMode = image.resizeMode ?? "contain";

    const handleNo = () => handleAccept("false");
    const handleYes = async () => void handleAccept("true");

    // we need the offersAgreement acceptance for running checkAvailableOffers
    const handleAccept = async (accepted: string) => {
      await AsyncStorage.removeItem("goodid_disputedSubjects");
      await props.onDataPermission(accepted);
      void nextStep();
    };

    return (
      <View {...props}>
        <VStack width={"100%"} space={8} justifyContent="center" alignItems="center">
          <TransTitle t={/*i18n*/ "You might qualify for extra money disbursements"} variant="title-gdblue" />
          <TransText
            t={
              /*i18n*/ "Would you like to receive offers specific to you, such as special rewards offers, humanitarian funds, climate relief disbursements, and financial services?"
            }
            variant="sm-grey-650"
          />
          <Center>
            <Image {...image} source={BillyGrin} style={{ resizeMode: resizeMode }} />
          </Center>
          <VStack space={6} justifyContent="flex-start" alignItems="center" width="100%">
            <TransText
              t={
                /*i18n*/ "By tapping “Yes” you’re allowing GoodLabs Ltd to read your GoodID until its expiration date only to show you offers relevant to you. We will not share your information with anyone. To read  our full Privacy Policy, go to {privy}"
              }
              variant="browse-wrap"
              values={{
                privy: (
                  <Link href="https://gooddollar.org/privacy-policy" isExternal>
                    <Text
                      style={{ fontFamily: "Roboto", fontSize: 12, color: "#7A88A5", textDecorationLine: "underline" }}
                    >
                      Privacy Policy
                    </Text>
                  </Link>
                )
              }}
            />

            <Center {...buttonContainer} justifyContent="flex-start">
              <TransButton
                t={/*i18n*/ "yes, i accept"}
                onPress={handleYes}
                width="100%"
                _text={{ textAlign: "left" }}
                textAlign="left"
                {...Platform.select({ android: { justifyContent: "flex-start" } })}
              />
              <TransButton
                t={/*i18n*/ "no"}
                onPress={handleNo}
                variant="link-like"
                _text={{ underline: false }}
                width="100%"
                {...Platform.select({ android: { justifyContent: "flex-start" } })}
              />
            </Center>
          </VStack>
        </VStack>
      </View>
    );
  }
);
