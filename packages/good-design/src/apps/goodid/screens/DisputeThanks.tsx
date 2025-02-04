import React from "react";
import { Center, VStack } from "native-base";
import { useWizard } from "react-use-wizard";

import { Image } from "../../../core/images";
import { TransButton, TransText, TransTitle } from "../../../core/layout";

import BillyDispute from "../../../assets/images/billy-dispute.png";

export const DisputeThanks = () => {
  const { activeStep, goToStep } = useWizard();

  return (
    <VStack space={8} width="100%">
      <VStack space={8} maxW="343" margin="auto">
        <TransTitle t={/*i18n*/ "Thanks for letting us know!"} variant="title-gdblue" />
        <TransText
          t={
            /*i18n*/ "Heads-up that information you’ve corrected may show as “Unverified” on your GoodID. \n\n This will not affect your ability to claim UBI!"
          }
          variant="sm-grey-650"
          textAlign="center"
        />
        <Center>
          <Image source={BillyDispute} w="265" h="116" style={{ resizeMode: "contain" }} />
        </Center>
      </VStack>
      <VStack space={6} justifyContent="center" alignItems="center">
        <TransButton
          t={/*i18n*/ "Next"}
          width="100%"
          maxW="343"
          variant="primary"
          onPress={() => goToStep(activeStep + 2)}
        />
      </VStack>
    </VStack>
  );
};
