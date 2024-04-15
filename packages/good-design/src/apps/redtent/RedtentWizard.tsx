import { ArrowBackIcon, Text, View } from "native-base";
import React, { useCallback, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Wizard, useWizard } from "react-use-wizard";
import { useModal } from "../../hooks";
import { GoodButton } from "../../core";
import { WebVideoUploader } from "../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../utils/WizardContext";

export type Props = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
  country: string;
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
    <View flex={"auto"} flexDir={"row"}>
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

const RedtentOffer = ({ country, onDone }: { country: string; onDone: Props["onDone"] }) => {
  const { nextStep } = useWizard();
  return (
    <View>
      <Text>Offer for {country}</Text>
      <GoodButton onPress={nextStep}>Upload Video Selfie</GoodButton>
      <GoodButton onPress={() => onDone()} variant={"link-like"} padding={0}>
        I don't want the extra UBI
      </GoodButton>
    </View>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => (
  <Text
    color={"primary"}
    textTransform={"capitalize"}
    fontWeight="700"
    fontFamily={"heading"}
    fontSize={"l"}
    textAlign={"center"}
    lineHeight={27.6}
  >
    {children}
  </Text>
);

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
      <Title>Video instructions</Title>
      <SubTitle>Submit a video selfie saying:</SubTitle>
      <WebVideoUploader onUpload={onUpload} isLoading={isLoading} />

      <GoodButton onPress={() => onDone()} padding={0} variant={"link-like"}>
        Nevermind, I don't want the extra UBI
      </GoodButton>
    </View>
  );
};

const RedtentThanks = ({ onDone }: { onDone: Props["onDone"] }) => {
  return (
    <View>
      <Title>Thanks you for submitting your video!</Title>
      <GoodButton onPress={() => onDone()} variant="standard">
        Next
      </GoodButton>
    </View>
  );
};

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
      <Wizard header={<WizardHeader onDone={modalOnDone} Modal={Modal} />}>
        <RedtentOffer country={props.country} onDone={modalOnDone} />
        <RedtentVideoInstructions onDone={modalOnDone} onVideo={modalOnVideo} />
        <RedtentThanks onDone={modalOnDone} />
      </Wizard>
    </WizardContextProvider>
  );
};
