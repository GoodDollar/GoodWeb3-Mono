import React, { useState } from "react";
import { Center, Container, Text, VStack } from "native-base";
// import { noop } from "lodash";

import { BaseButton, Image, LoaderModal, Title } from "../../../core";

import BillyGrin from "../../../assets/svg/billy-grin.svg";

export const OffersAgreement = () => {
  const [loading, setLoading] = useState(false);
  const handleAccept = () => {
    // should handle storing the user's agreement
    handleNext();
  };

  const handleNext = () => {
    setLoading(true);
    // should show creating good-id modal
    // should navigate to next screen
  };

  return (
    <>
      {loading ? (
        <LoaderModal
          title={`We are creating \n your GoodID`}
          overlay="dark"
          loading={loading}
          onClose={() => setLoading(false)}
        />
      ) : null}

      <Container width={375} paddingX={4} alignItems="center" maxWidth="100%">
        <VStack width={"100%"} space={8}>
          <Title fontSize="l" textAlign="center">
            You might qualify for extra money disbursements
          </Title>

          <Center>
            <Image source={BillyGrin} w={150} h={113} style={{ resizeMode: "contain" }} />
          </Center>
          <VStack space={6}>
            <Text fontSize="2xs" fontFamily="subheading" color="goodGrey.450" textAlign="center">
              {`By tapping “Yes” you’re allowing GoodLabs Ltd to read your 
GoodID until its expiration date only to show you offers relevant
to you. We will not share your information with anyone. To read 
our full Privacy Policy, go to http://gooddollar.org/privacy-policy`}
            </Text>

            <VStack space={4}>
              <BaseButton onPress={handleAccept} text="YES, I ACCEPT" maxW={343} variant="standard-blue" padding="0" />
              <BaseButton
                onPress={handleNext}
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
