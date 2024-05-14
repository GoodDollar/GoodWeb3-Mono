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
    <VStack space={200} width={"100%"}>
      <VStack space={8}>
        <Title variant="title-gdblue">{`Thanks for letting us \n know!`}</Title>
        <Text variant="sm-grey" textAlign="center">
          {`Heads-up that information you’ve corrected may \n show as “Unverified” on your GoodID. \n\n This will not affect your ability to claim UBI!`}
        </Text>
        <Center>
          <Image source={BillyDispute} w="265" h="116" style={{ resizeMode: "contain" }} />
        </Center>
      </VStack>
      <VStack space={6} justifyContent="center" alignItems="center" width="100%">
        <GoodButton width="100%" onPress={nextStep}>
          Next
        </GoodButton>
      </VStack>
    </VStack>
  );
};
