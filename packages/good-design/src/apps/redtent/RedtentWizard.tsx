import { ArrowBackIcon, Checkbox, HStack, Text, View, VStack } from "native-base";
import React, { FC, PropsWithChildren, useCallback, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Wizard, useWizard } from "react-use-wizard";
import { useModal } from "../../hooks";
import { GoodButton } from "../../core/buttons";
import ImageCard from "../../core/layout/ImageCard";
import { WebVideoUploader } from "../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../utils/WizardContext";
import { Title } from "../../core/layout";

import RedTentCard from "../../assets/images/redtentcard.png";
import { cardShadow } from "../../theme";

export type Props = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
};

const WizardHeader = ({ onDone, Modal }: { onDone: Props["onDone"]; Modal: any }) => {
  const { isFirstStep, previousStep, isLastStep, goToStep } = useWizard();

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      void onDone();
      return;
    }
    previousStep();
  }, [isFirstStep]);

  return (
    <View flex={"auto"} flexDir={"row"} width={375}>
      {/* Todo: Replace with styled error modal when design is finished */}
      <Modal
        body={
          <View>
            <Text>Error Modal</Text>
          </View>
        }
        _modalContainer={{ paddingBottom: 18, paddingLeft: 18, paddingRight: 18 }}
        onClose={() => goToStep(1)}
      />
      <View position={"relative"} display={"inline"} width={15}>
        <TouchableOpacity onPress={handleBack}>{isLastStep ? null : <ArrowBackIcon />}</TouchableOpacity>
      </View>

      <View flex={"auto"} flexDirection={"row"} justifyContent={"center"}>
        <Text>GoodID</Text>
      </View>
    </View>
  );
};

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

const BlueBullet = () => <Text variant="sm-grey" color="primary">{`\u2022`}</Text>;

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
      <VStack space={2} marginLeft={6} marginBottom={4}>
        {[
          { text: "Your first name" },
          { text: "Your age" },
          { text: "Your location" },
          { text: "What you plan to do with the money you receive" }
        ].map((item, index) => (
          <HStack key={index} space={2}>
            <BlueBullet />
            <Text variant="sm-grey">{item.text}</Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  </VStack>
);

const RedtentOffer = ({ onDone }: { onDone: Props["onDone"] }) => {
  const { nextStep } = useWizard();
  return (
    <View>
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

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <Text color={"goodGrey.600"} textTransform={"capitalize"} fontFamily={"subheading"} fontSize={"md"} lineHeight={25}>
    {children}
  </Text>
);

const RedtentVideoInstructions = ({ onDone, onVideo }: { onDone: Props["onDone"]; onVideo: Props["onVideo"] }) => {
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
    <View>
      <Title variant="title-gdblue">Video instructions</Title>
      <SubTitle>Submit a video selfie saying:</SubTitle>
      <WebVideoUploader onUpload={onUpload} isLoading={isLoading} />

      <GoodButton onPress={() => onDone()} padding={0} variant={"link-like"}>
        Nevermind, I don't want the extra UBI
      </GoodButton>
    </View>
  );
};

const RedtentThanks = ({ onDone }: { onDone: Props["onDone"] }) => (
  <View>
    <Title variant="title-gdblue">Thanks you for submitting your video!</Title>
    <GoodButton onPress={() => onDone()} variant="standard">
      Next
    </GoodButton>
  </View>
);

export const RedtentWizard: React.FC<Props> = (props: Props) => {
  const { showModal, Modal } = useModal();
  // inject show modal on callbacks exceptions
  const modalOnDone: Props["onDone"] = async error => {
    try {
      await props.onDone(error);
    } catch (e) {
      showModal();
    }
  };
  const modalOnVideo: Props["onVideo"] = async (...args) => {
    try {
      await props.onVideo(...args);
    } catch (e) {
      showModal();
    }
  };

  return (
    <WizardContextProvider>
      <Wizard header={<WizardHeader onDone={modalOnDone} Modal={Modal} />} wrapper={<WizardWrapper />}>
        <RedtentOffer onDone={modalOnDone} />
        <RedtentVideoInstructions onDone={modalOnDone} onVideo={modalOnVideo} />
        <RedtentThanks onDone={modalOnDone} />
      </Wizard>
    </WizardContextProvider>
  );
};
