import React, { useCallback, useEffect, useState } from "react";
import { Box, Checkbox, Center, HStack, Text, View, VStack, Spinner } from "native-base";
import { Wizard, useWizard } from "react-use-wizard";
import { Platform } from "react-native";
import { isBoolean, isEmpty } from "lodash";
import { Envs, useG$Formatted, useGetEnvChainId } from "@gooddollar/web3sdk-v2";

import { RedTentProps } from "../types";
import { withTheme } from "../../../theme/hoc/withTheme";
import ImageCard from "../../../core/layout/ImageCard";
import { Image } from "../../../core/images";
import { WebVideoUploader } from "../../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { BulletPointList, TransButton, TransText, TransTitle } from "../../../core/layout";
import { YouSureModal } from "../../../core/web3/modals";
import { useClaimContext } from "../../ubi";

import RedTentCard from "../../../assets/images/redtentcard.png";
import BillyPhone from "../../../assets/images/billy-phone.png";
import { cardShadow } from "../../../theme";
import { useSendAnalytics } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { UBIPoolOffer } from "../components";

const videoRequirements = [
  /*i18n*/ "Your first name",
  /*i18n*/ "Your age",
  /*i18n*/ "Your location",
  /*i18n*/ "What you plan to do with the money you receive"
];

const videoRestrictions = [/*i18n*/ "Maximum video length 30sec", /*i18n*/ "Maximum size 20mb"];
const videoUsagePolicy = [
  /*i18n*/ "Your video may be reviewed by the \n GoodLabs or partner teams for \n verification purposes. Your video \n will not be shared or used publicly, \n and will be erased after a period of \n time."
];

const offerCriteria = {
  location: {
    NG: /*i18n*/ "Nigeria",
    CO: /*i18n*/ "Colombia"
  },
  gender: {
    Female: /*i18n*/ "Female",
    Male: /*i18n*/ "Male"
  }
};

const CardContent = ({ offer }: { offer: UBIPoolOffer }) => {
  const formattedAmount = useG$Formatted(BigNumber.from(offer.claimAmount));

  return (
    <VStack space="0">
      <TransText
        t={
          /*i18n*/ `Claim every ${Number(offer.claimDayFrequency) === 1 ? `day:` : `${offer.claimDayFrequency} days:`}`
        }
        fontFamily="subheading"
        fontSize="sm"
        fontWeight="400"
        color="goodGrey.600"
      />
      <TransText t={`${formattedAmount}`} fontFamily="heading" color="gdPrimary" fontSize="l" fontWeight="700" />
    </VStack>
  );
};

const CardFooter = ({ linkText }: { linkText: string }) => (
  <TransText t={linkText} mr="auto" fontSize="sm" fontFamily="subheading" fontWeight="400" color="gdPrimary">
    {linkText}
  </TransText>
);

const PoolRequirements = ({ offer }: { offer: any }) => {
  const gender = offer.Gender;
  const country = offerCriteria.location[offer.Location.countryCode as keyof typeof offerCriteria.location];

  return (
    <VStack space={6}>
      <TransTitle t={/*i18n*/ "To qualify for this pool you need to: "} variant="subtitle-grey" />
      <VStack space="4">
        <HStack space={2}>
          <Checkbox variant="styled-blue" isDisabled defaultIsChecked colorScheme="info" value="female" />
          <HStack alignItems="flex-start" flexShrink={1}>
            <TransText
              t={/*i18n*/ "Have verified your gender as {gender} in your GoodID"}
              variant="sm-grey-650"
              values={{
                gender: <TransText t={gender} variant="sm-grey-650" fontWeight="bold" />
              }}
            />
          </HStack>
        </HStack>

        <HStack space={2}>
          <Checkbox variant="styled-blue" isDisabled defaultIsChecked colorScheme="info" value="location" />
          <TransText
            t={/*i18n*/ "Have verified your country as {country} in your GoodID"}
            variant="sm-grey-650"
            values={{
              country: <TransText t={country} fontWeight="bold" variant="sm-grey-650" />
            }}
          />
        </HStack>

        <HStack space={2}>
          <Checkbox isDisabled colorScheme="info" value="test" />
          <TransText t={/*i18n*/ "Submit a video selfie saying: "} variant="sm-grey-650" />
        </HStack>
        <BulletPointList bulletPoints={videoRequirements} />
      </VStack>
    </VStack>
  );
};

const RedtentOffer = ({
  dontShowAgainKey,
  onDone,
  offer
}: {
  onDone: RedTentProps["onDone"];
  dontShowAgainKey: string;
  offer: UBIPoolOffer;
}) => {
  const { nextStep } = useWizard();
  const [showModal, setShowModal] = useState(false);
  const { track } = useSendAnalytics();
  const [hasFired, setHasFired] = useState(false);

  const { activePoolAddresses } = useClaimContext();
  const { baseEnv } = useGetEnvChainId();
  const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
  const { goodCollectiveUrl } = Envs[devEnv];

  const offerTitle =
    /*i18n*/ "Red Tent Women in " +
    offerCriteria.location[offer.Location?.countryCode as keyof typeof offerCriteria.location];

  const offerLink = `${goodCollectiveUrl}collective/${activePoolAddresses[offer.Location?.countryCode || ""]}`;

  const handleSkip = () => {
    track("offer_declined", { offer: offerTitle });
    setShowModal(true);
  };

  const handleStart = () => {
    track("offer_start", { offer: offerTitle });
    void nextStep();
  };

  const handleOnDone = () => {
    setShowModal(false);
    void onDone(true);
  };

  useEffect(() => {
    if (!hasFired) {
      track("offer_show", { offer: offerTitle });
      setHasFired(true);
    }
  }, []);

  if (isEmpty(offer)) return <Spinner variant="lg" />;

  return (
    <View maxWidth="343" margin="auto" paddingBottom={6}>
      <YouSureModal
        open={showModal}
        action={handleOnDone}
        type="offers"
        onClose={onDone}
        dontShowAgainKey={dontShowAgainKey}
      />
      <VStack space={10}>
        <TransTitle t={/*i18n*/ "You are eligible to claim more GoodDollars!"} variant="title-gdblue" />
        <ImageCard
          variant="offer-card"
          title={offerTitle}
          content={<CardContent offer={offer} />}
          footer={<CardFooter linkText={/*i18n*/ "Learn more>>"} />}
          picture={RedTentCard}
          link={offerLink}
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
          {...Platform.select({
            web: {
              style: cardShadow
            }
          })}
          borderRadius={20}
        />
      </VStack>
      <PoolRequirements {...{ offer }} />
      <VStack space={4}>
        <TransButton t={/*i18n*/ "Upload Video Selfie"} onPress={handleStart} />
        <TransButton t={/*i18n*/ "Skip for now"} onPress={handleSkip} variant={"link-like"} padding={0} />
      </VStack>
    </View>
  );
};

const RedtentVideoInstructions = withTheme({ name: "RedtentVideoInstructions" })(
  ({ onDone, onVideo, ...props }: { onDone: RedTentProps["onDone"]; onVideo: RedTentProps["onVideo"] }) => {
    const { nextStep } = useWizard();
    const [isLoading, setLoading] = useState(false);
    const { track } = useSendAnalytics();

    const onUpload = useCallback(
      async (video?: { base64: string; extension: string }, error?: Error) => {
        track("offer_video_upload_start");
        if (!video || error) {
          void onDone(error || new Error("Video upload failed"));
          return;
        }
        setLoading(true);
        try {
          await onVideo(video.base64, video.extension);
          void nextStep();
        } catch (e) {
          void onDone(e as Error);
        } finally {
          setLoading(false);
        }
      },
      [onDone]
    );

    return (
      <VStack space={6} paddingBottom={6} {...props}>
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

const RedtentThanks = ({ onDone, offer }: { onDone: RedTentProps["onDone"]; offer: any }) => {
  // when passed down directly into an inline callback, for some reason the onDone is not being called
  const onPress = async () => {
    void onDone(true);
  };

  return (
    <VStack paddingBottom={6} {...Platform.select({ web: { height: "100%", justifyContent: "space-between" } })}>
      <VStack space={6} maxWidth={360} marginX="auto" {...Platform.select({ android: { marginY: "auto" } })}>
        <TransTitle t={/*i18n*/ "Thanks you for submitting your video!"} variant="title-gdblue" />
        <Box
          justifyContent="flex-start"
          paddingBottom={8}
          borderBottomWidth={1}
          borderBottomColor="goodGrey.300"
          ml="auto"
          mr="auto"
        >
          <Text variant="sm-grey-650">
            <TransText t={/*i18n*/ "You are now in the"} variant="sm-grey-650" />
            <TransText
              t={
                /*i18n*/ " Red Tent Woman in " +
                offerCriteria.location[offer.Location.countryCode as keyof typeof offerCriteria.location]
              }
              variant="sm-grey-650"
              fontWeight="bold"
              color="gdPrimary"
            />
            <TransText t={/*i18n*/ " GoodCollective. You can claim this additional UBI daily."} variant="sm-grey-650" />
          </Text>
        </Box>
        <TransButton t={/*i18n*/ "Next"} onPress={onPress} variant="standard" />
      </VStack>
    </VStack>
  );
};

export const RedtentWizard: React.FC<RedTentProps> = (props: RedTentProps) => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const { videoInstructStyles } = props;
  const dontShowAgainKey = "goodid_noOffersModalAgain";
  const { track } = useSendAnalytics();
  // inject show modal on callbacks exceptions

  const modalOnDone: RedTentProps["onDone"] = async errorOnDone => {
    try {
      if (!isBoolean(errorOnDone)) {
        track("offer_video_error", { error: errorOnDone });
      }

      track("offer_success");

      await props.onDone(errorOnDone);
    } catch (e: any) {
      props.onError && props.onError(error);
    }
  };
  const modalOnVideo: RedTentProps["onVideo"] = async (...args) => {
    try {
      await props.onVideo(...args);
    } catch (e: any) {
      setError(e.message);
      throw new Error(e);
    }
  };

  return (
    <WizardContextProvider>
      <Wizard>
        <RedtentOffer onDone={modalOnDone} dontShowAgainKey={dontShowAgainKey} offer={props.availableOffers?.[0]} />
        <RedtentVideoInstructions
          onDone={modalOnDone}
          onVideo={modalOnVideo}
          onError={props.onError}
          {...videoInstructStyles}
        />
        <RedtentThanks onDone={modalOnDone} offer={props.availableOffers?.[0]} />
      </Wizard>
    </WizardContextProvider>
  );
};
