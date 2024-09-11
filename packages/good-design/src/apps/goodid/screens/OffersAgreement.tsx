import React from "react";
import { Center, Container, IContainerProps, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { TransText, TransTitle } from "../../../core/layout";
import { GoodButton } from "../../../core/buttons";
import { Image } from "../../../core/images";

import BillyGrin from "../../../assets/images/billy-grin.png";
import { withTheme } from "../../../theme";

export const OffersAgreement = withTheme({ name: "OffersAgreement" })(
  ({ styles, ...props }: IContainerProps & { styles?: any; onDataPermission: (accepted: string) => Promise<void> }) => {
    const { nextStep } = useWizard();
    const { buttonContainer, image } = styles ?? {};
    const resizeMode = image.resizeMode ?? "contain";

    const handleNo = () => handleAccept("false");
    const handleYes = () => handleAccept("true");
    // we need the offersAgreement acceptance for running checkAvailableOffers
    const handleAccept = async (accepted: string) => {
      await props.onDataPermission(accepted);
      void nextStep();
    };

    return (
      <>
        <Container {...props}>
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
            <VStack space={6} alignItems="center">
              <TransText
                t={
                  /*i18n*/ "By tapping “Yes” you’re allowing GoodLabs Ltd to read your GoodID until its expiration date only to show you offers relevant to you. We will not share your information with anyone. To read  our full Privacy Policy, go to http://gooddollar.org/privacy-policy"
                }
                variant="browse-wrap"
              />

              <VStack {...buttonContainer}>
                <GoodButton onPress={handleYes} width="100%">
                  <TransText t={/*i18n*/ "yes, i accept"}></TransText>
                </GoodButton>
                <GoodButton onPress={handleNo} variant="link-like" _text={{ underline: false }}>
                  <TransText t={/*i18n*/ "no"} />
                </GoodButton>
              </VStack>
            </VStack>
          </VStack>
        </Container>
      </>
    );
  }
);
