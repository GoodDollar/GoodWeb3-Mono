import React, { useContext } from "react";
import { Center, Container, IContainerProps, Text, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { WizardContext } from "../../../utils/WizardContext";
import { GoodButton, Image, Title } from "../../../core";

import BillyGrin from "../../../assets/images/billy-grin.png";
import { withTheme } from "../../../theme";

export const OffersAgreement = withTheme({ name: "OffersAgreement" })(
  ({ styles, ...props }: IContainerProps & { styles?: any }) => {
    const { updateDataValue } = useContext(WizardContext);
    const { nextStep } = useWizard();
    const { buttonContainer, image } = styles ?? {};
    const resizeMode = image.resizeMode ?? "contain";

    // we need the offersAgreement acceptance for running checkAvailableOffers
    const handleAccept = () => {
      updateDataValue("segmentation", "offersAgreement", true);
      void nextStep();
    };

    return (
      <>
        <Container {...props}>
          <VStack width={"100%"} space={8}>
            <Title variant="title-gdblue">You might qualify for extra money disbursements</Title>
            <Text variant="sm-grey">{`Would you like to receive offers specific to you, \nsuch as special rewards offers, humanitarian \nfunds, climate relief disbursements, and \nfinancial services?`}</Text>

            <Center>
              <Image {...image} source={BillyGrin} style={{ resizeMode: resizeMode }} />
            </Center>
            <VStack space={6}>
              <Text variant="browse-wrap">
                {`By tapping “Yes” you’re allowing GoodLabs Ltd to read your 
GoodID until its expiration date only to show you offers relevant
to you. We will not share your information with anyone. To read 
our full Privacy Policy, go to http://gooddollar.org/privacy-policy`}
              </Text>

              <VStack {...buttonContainer}>
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
  }
);
