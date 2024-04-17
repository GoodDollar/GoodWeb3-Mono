import React from "react";
import { Center, Container, Text, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { BaseButton, Image, Title } from "../../../core";

import BillyGrin from "../../../assets/svg/billy-grin.svg";

export const OffersAgreement = () => {
  const { nextStep } = useWizard();
  const handleAccept = () => {
    // Todo: store users decision in wizardcontext
    void nextStep();
  };

  return (
    <>
      <Container width={375} paddingX={4} alignItems="center" maxWidth="100%">
        <VStack width={"100%"} space={8}>
          <Title fontSize="l" textAlign="center">
            You might qualify for extra money disbursements
          </Title>

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
              <BaseButton onPress={handleAccept} text="YES, I ACCEPT" maxW={343} variant="standard-blue" padding="0" />
              <BaseButton
                onPress={nextStep}
                text="NO"
                padding="0"
                innerView={{
                  width: 343,
                  textAlign: "center",
                  margin: 0
                }}
                innerText={{ fontFamily: "subheading", fontSize: "sm", fontWeight: "bold", color: "goodGrey.500" }}
              />
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </>
  );
};
