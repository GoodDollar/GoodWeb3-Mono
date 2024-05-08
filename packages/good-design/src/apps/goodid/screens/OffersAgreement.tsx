import React from "react";
import { Center, Container, Text, VStack } from "native-base";
import { useWizard } from "react-use-wizard";
import { AsyncStorage } from "@gooddollar/web3sdk-v2";

import { GoodButton, Image, Title } from "../../../core";

import BillyGrin from "../../../assets/images/billy-grin.png";

export const OffersAgreement = () => {
  const { nextStep } = useWizard();

  // we need the offersAgreement acceptance for running checkAvailableOffers
  const handleAccept = async () => {
    // handle through controller
    await AsyncStorage.setItem("goodid_permission", "true");
    void nextStep();
  };

  return (
    <>
      <Container width={375} paddingX={4} alignItems="center" maxWidth="100%">
        <VStack width={"100%"} space={8}>
          <Title fontSize="l" textAlign="center">
            You might qualify for extra money disbursements
          </Title>
          <Text variant="sm-grey">{`Would you like to receive offers specific to you, \nsuch as special rewards offers, humanitarian \nfunds, climate relief disbursements, and \nfinancial services?`}</Text>

          <Center>
            <Image source={BillyGrin} w={150} h={113} style={{ resizeMode: "contain" }} />
          </Center>
          <VStack space={6}>
            <Text variant="browse-wrap">
              {`By tapping “Yes” you’re allowing GoodLabs Ltd to read your 
GoodID until its expiration date only to show you offers relevant
to you. We will not share your information with anyone. To read 
our full Privacy Policy, go to http://gooddollar.org/privacy-policy`}
            </Text>

            <VStack space={4}>
              <GoodButton onPress={handleAccept}>yes, i accept</GoodButton>
              <GoodButton onPress={nextStep} variant="link-like" _text={{ underline: false }}>
                no
              </GoodButton>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </>
  );
};
