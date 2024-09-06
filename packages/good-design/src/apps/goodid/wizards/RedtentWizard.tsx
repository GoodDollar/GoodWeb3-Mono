import { Checkbox, Center, HStack, Text, View, VStack, Box } from "native-base";
import React, { FC, PropsWithChildren, useCallback, useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";

import { withTheme } from "../../../theme";
import ImageCard from "../../../core/layout/ImageCard";
import { Image } from "../../../core/images";
import { WebVideoUploader } from "../../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { BulletPointList, TransButton, TransText, TransTitle } from "../../../core/layout";
import { YouSureModal } from "../../../core/web3/modals";

import RedTentCard from "../../../assets/images/redtentcard.png";
import BillyPhone from "../../../assets/images/billy-phone.png";
import { cardShadow } from "../../../theme";

import { WizardHeader } from ".";

export type RedTentProps = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
  withNavBar: boolean;
  containerStyles?: any;
  headerStyles?: any;
  videoInstructStyles?: any;
};

const videoRequirements = [
  /*i18n*/ "Your first name",
  /*i18n*/ "Your age",
  /*i18n*/ "Your location",
  /*i18n*/ "What you plan to do with the money you receive"
];

const videoRestrictions = [/*i18n*/ "Maximum video length 30sec", /*i18n*/ "Maximum size 20mb"];
const videoUsagePolicy = [
  /*i18n*/ `Your video may be reviewed by the \n GoodLabs or partner teams for \n verification purposes. Your video \n will not be shared or used publicly, \n and will be erased after a period of \n time.`
];

const WizardWrapper: FC<PropsWithChildren> = ({ children, ...props }) => (
  <View mr="auto" ml="auto" {...props}>
    {children}
  </View>
);

const CardContent = () => (
  <VStack space="0">
    <TransText
      t={/*i18n*/ "Claim weekly:"}
      fontFamily="subheading"
      fontSize="sm"
      fontWeight="400"
      color="goodGrey.600"
    />
    <TransText t={/*i18n*/ "10.000G$"} fontFamily="heading" color="primary" fontSize="l" fontWeight="700" />
  </VStack>
);

const CardFooter = ({ linkText }: { linkText: string }) => (
  <TransText t={linkText} mr="auto" fontSize="sm" fontFamily="subheading" fontWeight="400" color="primary">
    {linkText}
  </TransText>
);

const PoolRequirements = () => (
  <VStack space={6}>
    <TransTitle t={/*i18n*/ "To qualify for this pool you need to: "} variant="subtitle-grey" />
    <VStack space="4">
      <HStack space={2}>
        <Checkbox variant="styled-blue" isDisabled defaultIsChecked colorScheme="info" value="female" />
        <HStack alignItems="flex-start">
          <TransText t={/*i18n*/ "Have verified your gender as"} variant="sm-grey-650" />
          <TransText t={/*i18n*/ " Female "} variant="sm-grey-650" fontWeight="bold" />
          <TransText t={/*i18n*/ "in your GoodID"} variant="sm-grey-650" />
        </HStack>
      </HStack>
      <HStack space={2}>
        <Checkbox variant="styled-blue" isDisabled defaultIsChecked colorScheme="info" value="location" />
        <Text variant="sm-grey-650">
          Have verified your country as <Text fontWeight="bold">Nigeria</Text> in your GoodID
        </Text>
      </HStack>
      <HStack space={2}>
        <Checkbox isDisabled colorScheme="info" value="test" />
        <TransText t={/*i18n*/ "Submit a video selfie saying: "} variant="sm-grey-650" />
      </HStack>
      <BulletPointList bulletPoints={videoRequirements} />
    </VStack>
  </VStack>
);

const RedtentOffer = ({ onDone }: { onDone: RedTentProps["onDone"] }) => {
  const { nextStep } = useWizard();
  const [showModal, setShowModal] = useState(false);

  const handleSkip = () => {
    setShowModal(true);
  };

  const handleOnDone = () => {
    setShowModal(false);
    void onDone();
  };

  return (
    <View>
      <VStack space={10}>
        <YouSureModal
          open={showModal}
          action={handleOnDone}
          type="offers"
          onClose={onDone}
          dontShowAgainKey="noOffersModalAgain"
        />
        <TransTitle t={/*i18n*/ "You are eligible for \n additional UBI!"} variant="title-gdblue" />
        <ImageCard
          variant="offer-card"
          title={/*i18n*/ "Red Tent Women in Nigeria"}
          content={<CardContent />}
          footer={<CardFooter linkText={/*i18n*/ "Learn more>>"} />}
          picture={RedTentCard}
          link="https://www.google.com" // todo: add link to good-collective pool page
          styles={{
            picture: { resizeMode: "cover" },
            container: { width: "100%", alignItems: "flex-start" },
            title: {
              fontFamily: "subheading",
              fontSize: "md",
              fontWeight: "500",
              color: "goodGrey.600",
              paddingBottom: 2
            }
          }}
          style={cardShadow}
          borderRadius={20}
        />
      </VStack>
      <PoolRequirements />
      <VStack space={4}>
        <TransButton t={/*i18n*/ "Upload Video Selfie"} onPress={nextStep} />
        <TransButton t={/*i18n*/ "Skip for now"} onPress={handleSkip} variant={"link-like"} padding={0} />
      </VStack>
    </View>
  );
};

const RedtentVideoInstructions = withTheme({ name: "RedtentVideoInstructions" })(
  ({ onDone, onVideo, ...props }: { onDone: RedTentProps["onDone"]; onVideo: RedTentProps["onVideo"] }) => {
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
      <VStack space={6} {...props}>
        <TransTitle t={/*i18n*/ "Video instructions"} variant="title-gdblue" />
        <Center>
          <Image source={BillyPhone} width={126} height={156} />
        </Center>

        {[
          { title: /*i18n*/ "Submit a video selfie", pointsList: videoRequirements },
          { title: /*i18n*/ "Restrictions", pointsList: videoRestrictions },
          { title: /*i18n*/ "How will my video be used?", pointsList: videoUsagePolicy }
        ].map(({ title, pointsList }) => (
          <VStack key={title} space={2}>
            <TransTitle t={title} variant="subtitle-grey" />
            <BulletPointList bulletPoints={pointsList} />
          </VStack>
        ))}

        <WebVideoUploader onUpload={onUpload} isLoading={isLoading} />
      </VStack>
    );
  }
);

const RedtentThanks = ({ onDone }: { onDone: RedTentProps["onDone"] }) => {
  // when passed down directly into an inline callback, for some reason the onDone is not being called
  const onPress = () => {
    void onDone();
  };

  return (
    <VStack space={200}>
      <VStack space={6}>
        <TransTitle t={/*i18n*/ "Thanks you for submitting your video!"} variant="title-gdblue" />
        <Box
          display="block"
          justifyContent="flex-start"
          paddingBottom={8}
          borderBottomWidth={1}
          borderBottomColor="goodGrey.300"
          ml="auto"
          mr="auto"
        >
          <TransText t={/*i18n*/ "You are now in the"} variant="sm-grey-650" />
          <TransText
            t={/*i18n*/ " Red Tent Woman in Nigeria \n"}
            variant="sm-grey-650"
            fontWeight="bold"
            color="primary"
          />
          <TransText t={/*i18n*/ "GoodCollective. You can claim this additional UBI daily."} variant="sm-grey-650" />
        </Box>
      </VStack>
      <TransButton t={/*i18n*/ "Next"} onPress={onPress} variant="standard" />
    </VStack>
  );
};

export const RedtentWizard: React.FC<RedTentProps> = (props: RedTentProps) => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const { containerStyles, headerStyles, videoInstructStyles } = props;
  // inject show modal on callbacks exceptions
  const modalOnDone: RedTentProps["onDone"] = async error => {
    try {
      console.log("modalOnDone -- redtent wizard -->", { error, props });
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
      <Wizard
        header={<WizardHeader withNavBar={props.withNavBar} onDone={modalOnDone} error={error} {...headerStyles} />}
        wrapper={<WizardWrapper {...containerStyles} />}
      >
        <RedtentOffer onDone={modalOnDone} />
        <RedtentVideoInstructions onDone={modalOnDone} onVideo={modalOnVideo} {...videoInstructStyles} />
        <RedtentThanks onDone={modalOnDone} />
      </Wizard>
    </WizardContextProvider>
  );
};
