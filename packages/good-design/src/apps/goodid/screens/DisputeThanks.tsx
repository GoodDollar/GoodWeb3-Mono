import React from "react";
import { Center, VStack, Text } from "native-base";
import { useWizard } from "react-use-wizard";

import { Image } from "../../../core/images";
import { GoodButton } from "../../../core/buttons";
import { Title } from "../../../core/layout";

import BillyDispute from "../../../assets/images/billy-dispute.png";

//todo: add theming
export const DisputeThanks = () => {
  const { nextStep } = useWizard();

  return (
    <VStack space={8} width="100%">
      <VStack space={8}>
        <Title variant="title-gdblue">{`Thanks for letting us know!`}</Title>
        <Text variant="sm-grey-650" textAlign="center">
          {`Heads-up that information you’ve corrected may show as “Unverified” on your GoodID. \n\n This will not affect your ability to claim UBI!`}
        </Text>
        <Center>
          <Image source={BillyDispute} w="265" h="116" style={{ resizeMode: "contain" }} />
        </Center>
      </VStack>
      <VStack space={6} justifyContent="center" alignItems="center">
        <GoodButton width="100%" maxWidth="343" onPress={nextStep}>
          Next
        </GoodButton>
      </VStack>
    </VStack>
  );
};
