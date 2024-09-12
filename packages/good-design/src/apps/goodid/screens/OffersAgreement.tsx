import React from "react";
import { Center, Container, IContainerProps, Link, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { TransButton, TransText, TransTitle } from "../../../core/layout";
import { Image } from "../../../core/images";

import BillyGrin from "../../../assets/images/billy-grin.png";
import { withTheme } from "../../../theme/hoc/withTheme";

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
                  /*i18n*/ "By tapping “Yes” you’re allowing GoodLabs Ltd to read your GoodID until its expiration date only to show you offers relevant to you. We will not share your information with anyone. To read  our full Privacy Policy, go to {privy}"
                }
                variant="browse-wrap"
                values={{
                  privy: <Link href="https://gooddollar.org/privacy-policy">https://gooddollar.org/privacy-policy</Link>
                }}
              />

              <VStack {...buttonContainer}>
                <TransButton t={/*i18n*/ "yes, i accept"} onPress={handleYes} width="100%" />
                <TransButton
                  t={/*i18n*/ "no"}
                  width="100%"
                  onPress={handleNo}
                  variant="link-like"
                  _text={{ underline: false }}
                />
              </VStack>
            </VStack>
          </VStack>
        </Container>
      </>
    );
  }
);
