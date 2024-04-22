import React, { useCallback, useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { Text, View } from "native-base";

import { GoodButton } from "../../../core/buttons";
import { WebVideoUploader } from "../../../core/inputs/WebVideoUploader";
import { WizardContextProvider } from "../../../utils/WizardContext";
import { WizardHeader } from ".";

export type RedTentProps = {
  onVideo: (base64: string, extension: string) => Promise<void>;
  onDone: (error?: Error) => Promise<void>;
  country: string;
};

const RedtentOffer = ({ country, onDone }: { country: string; onDone: RedTentProps["onDone"] }) => {
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

const RedtentThanks = ({ onDone }: { onDone: RedTentProps["onDone"] }) => {
  return (
    <View>
      <Title>Thanks you for submitting your video!</Title>
      <GoodButton onPress={() => onDone()} variant="standard">
        Next
      </GoodButton>
    </View>
  );
};

export const RedtentWizard: React.FC<RedTentProps> = (props: RedTentProps) => {
  const [error, setError] = useState<string | null>(null);
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
      <Wizard header={<WizardHeader onDone={modalOnDone} error={error} />}>
        <RedtentOffer country={props.country} onDone={modalOnDone} />
        <RedtentVideoInstructions onDone={modalOnDone} onVideo={modalOnVideo} />
        <RedtentThanks onDone={modalOnDone} />
      </Wizard>
    </WizardContextProvider>
  );
};
