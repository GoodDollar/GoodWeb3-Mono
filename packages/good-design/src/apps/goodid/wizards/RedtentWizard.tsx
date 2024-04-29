import { Checkbox, Center, HStack, Text, View, VStack } from "native-base";
import React, { FC, PropsWithChildren, useCallback, useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";

import { GoodButton } from "../../../core/buttons";
import ImageCard from "../../../core/layout/ImageCard";
import { Image } from "../../../core/images";
import { WebVideoUploader } from "../../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { BulletPointList, Title } from "../../../core/layout";

import RedTentCard from "../../../assets/images/redtentcard.png";
import BillyPhone from "../../../assets/images/billy-phone.png";
import { cardShadow } from "../../../theme";

import { WizardHeader } from ".";

export type RedTentProps = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
};

const videoRequirements = [
  "Your first name",
  "Your age",
  "Your location",
  "What you plan to do with the money you receive"
];

const videoRestrictions = ["Maximum video length 30sec", "Maximum size 20mb"];
const videoUsagePolicy = [
  `Your video may be reviewed by the \n GoodLabs or partner teams for \n verification purposes. Your video \n will not be shared or used publicly, \n and will be erased after a period of \n time.`
];

const WizardWrapper: FC<PropsWithChildren> = ({ children }) => <View width={375}>{children}</View>;

const CardContent = () => (
  <VStack space="0">
    <Text fontFamily="subheading" fontSize="sm" fontWeight="400" color="goodGrey.600">
      Claim weekly:
    </Text>
    <Text fontFamily="heading" color="primary" fontSize="l" fontWeight="700">
      10.000G$
    </Text>
  </VStack>
);

const CardFooter = ({ linkText }: { linkText: string }) => (
  <Text mr="auto" fontSize="sm" fontFamily="subheading" fontWeight="400" color="primary">
    {linkText}
  </Text>
);

const PoolRequirements = () => (
  <VStack space={6}>
    <Title variant="subtitle-grey">To qualify for this pool you need to:</Title>
    <VStack space="4">
      <HStack space={2}>
        <Checkbox variant="styled-blue" isDisabled defaultIsChecked colorScheme="info" value="female" />
        <Text variant="sm-grey">
          Have verified your gender as <Text fontWeight="bold">Female</Text> in your GoodID
        </Text>
      </HStack>
      <HStack space={2}>
        <Checkbox variant="styled-blue" defaultIsChecked colorScheme="info" value="location" />
        <Text variant="sm-grey">
          Have verified your country as <Text fontWeight="bold">Nigeria</Text> in your GoodID
        </Text>
      </HStack>
      <HStack space={2}>
        <Checkbox isDisabled colorScheme="info" value="test" />
        <Text variant="sm-grey">Submit a video selfie saying:</Text>
      </HStack>
      <BulletPointList bulletPoints={videoRequirements} />
    </VStack>
  </VStack>
);

const RedtentOffer = ({ onDone }: { onDone: RedTentProps["onDone"] }) => {
  const { nextStep } = useWizard();
  return (
    <View>
      <VStack space={10}>
        <Title variant="title-gdblue">{`You are eligible for \n additional UBI!`}</Title>
        <ImageCard
          variant="offer-card"
          title="Red Tent Women in Nigeria"
          content={<CardContent />}
          footer={<CardFooter linkText={`Learn more>>`} />}
          picture={RedTentCard}
          link="https://www.google.com" // todo: add link to good-collective pool page
          pictureStyles={{ resizeMode: "cover" }}
          containerStyles={{ paddingY: 4, paddingX: 4, width: "100%", alignItems: "flex-start" }}
          titleStyles={{
            fontFamily: "subheading",
            fontSize: "md",
            fontWeight: "500",
            color: "goodGrey.600",
            paddingBottom: 2
          }}
          style={cardShadow}
          borderRadius={20}
        />
      </VStack>
      <PoolRequirements />
      <VStack space={4}>
        <GoodButton onPress={nextStep}>Upload Video Selfie</GoodButton>
        <GoodButton onPress={() => onDone()} variant={"link-like"} padding={0}>
          I don't want the extra UBI
        </GoodButton>
      </VStack>
    </View>
  );
};

const RedtentVideoInstructions = ({
  onDone,
  onVideo
}: {
  onDone: RedTentProps["onDone"];
  onVideo: RedTentProps["onVideo"];
}) => {
  const { nextStep } = useWizard();
  const [isLoading, setLoading] = useState(false);

  const onUpload = useCallback(
    async (video?: { base64: string; extension: string }, error?: Error) => {
      if (!video || error) {
        void onDone(error || new Error("Video upload failed"));
        return;
      }
      setLoading(true);
      try {
        await onVideo(video.base64, video.extension);
      } catch (e) {
        void onDone(e as Error);
      } finally {
        setLoading(false);
        void nextStep();
      }
    },
    [onDone]
  );

  return (
    <VStack space={6}>
      <Title variant="title-gdblue">Video instructions</Title>
      <Center>
        <Image source={BillyPhone} width={126} height={156} />
      </Center>

      {[
        { title: "Submit a video selfie", pointsList: videoRequirements },
        { title: "Restrictions", pointsList: videoRestrictions },
        { title: "How will my video be used?", pointsList: videoUsagePolicy }
      ].map(({ title, pointsList }) => (
        <VStack key={title} space={2}>
          <Title variant="subtitle-grey">{title}</Title>
          <BulletPointList bulletPoints={pointsList} />
        </VStack>
      ))}

      <WebVideoUploader onUpload={onUpload} isLoading={isLoading} />

      <GoodButton onPress={() => onDone()} padding={0} variant={"link-like"}>
        Nevermind, I don't want the extra UBI
      </GoodButton>
    </VStack>
  );
};

const RedtentThanks = ({ onDone }: { onDone: RedTentProps["onDone"] }) => (
  <VStack space={200}>
    <VStack space={6}>
      <Title variant="title-gdblue">Thanks you for submitting your video!</Title>
      <HStack paddingBottom={8} borderBottomWidth={1} borderBottomColor="goodGrey.300">
        <Text variant="sm-grey">
          You are now in the{" "}
          <Text fontWeight="bold" color="primary">
            {`Red Tent Women in Nigeria \n`}
          </Text>
          GoodCollective. You can claim this additional UBI daily.
        </Text>
      </HStack>
    </VStack>
    <GoodButton onPress={() => onDone()} variant="standard">
      Next
    </GoodButton>
  </VStack>
);

export const RedtentWizard: React.FC<RedTentProps> = (props: RedTentProps) => {
  const [error, setError] = useState<Error | undefined>(undefined);
  // inject show modal on callbacks exceptions
  const modalOnDone: RedTentProps["onDone"] = async error => {
    try {
      await props.onDone(error);
    } catch (e: any) {
      setError(e.message);
    }
  };
  const modalOnVideo: RedTentProps["onVideo"] = async (...args) => {
    try {
      await props.onVideo(...args);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <WizardContextProvider>
      <Wizard header={<WizardHeader onDone={modalOnDone} error={error} />} wrapper={<WizardWrapper />}>
        <RedtentOffer onDone={modalOnDone} />
        <RedtentVideoInstructions onDone={modalOnDone} onVideo={modalOnVideo} />
        <RedtentThanks onDone={modalOnDone} />
      </Wizard>
    </WizardContextProvider>
  );
};
