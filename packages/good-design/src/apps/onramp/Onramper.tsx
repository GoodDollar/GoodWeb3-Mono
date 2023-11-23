import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Box, Circle, HStack, Stack, Text, VStack } from "native-base";
import { AsyncStorage, isMobile as deviceDetect } from "@gooddollar/web3sdk-v2";

import { CentreBox } from "../../core/layout/CentreBox";
import { AnimatedProgress } from "../../core/animated";
import { Divider } from "native-base";
import { BaseButton } from "../../core";
import { useWindowFocus } from "../../hooks";

export type OnramperCallback = (event: WebViewMessageEvent) => void;

const stepValues = [0, 0, 50, 50, 100, 100];

const useStepValues = (step: number, animationDuration = 1000) => {
  const [progressValue, setProgressValue] = useState(0);
  const animationDurationRef = useRef(animationDuration);

  useEffect(() => {
    let intervalId: any;

    if (step > 0) {
      intervalId = setInterval(() => {
        // reset to old step end (current step start) then set to step end again
        [-1, 0].forEach(shift => setProgressValue(stepValues[step + shift]));
      }, animationDurationRef.current);
    } else {
      setProgressValue(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [step]);

  return progressValue;
};

const StepsProgress = ({ step }: { step: number }) => {
  const progressValue = useStepValues(step);

  return (
    <HStack w="90%" position="absolute" left="30" display="flex" justifyContent="center">
      <CentreBox h="50" w="238" position="absolute">
        <AnimatedProgress value={progressValue} />
      </CentreBox>
    </HStack>
  );
};

const Stepper = memo(({ step = 0 }: { step: number }) => (
  <VStack direction={"row"} mb={6} justifyContent="center" justifyItems="center" position="relative">
    <StepsProgress step={step} />
    <HStack alignItems="center" h="70" justifyContent="space-between" w="300">
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="10" bgColor={step > 0 ? "primary" : "goodGrey.300"}>
          <Text color={step > 0 ? "white" : "goodGrey.700"}> 1 </Text>
        </Circle>
        <Text color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          Buy cUSD
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="10" bgColor={step <= 2 ? "goodGrey.300" : "primary"}>
          <Text color={step <= 2 ? "goodGrey.700" : "white"}> 2 </Text>
        </Circle>
        <Text w="112" color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          We swap cUSD to G$
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="10" bgColor={step < 5 ? "goodGrey.300" : "primary"}>
          <Text color={step < 5 ? "goodGrey.700" : "white"}> 3 </Text>
        </Circle>
        <Text color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          Done
        </Text>
      </Stack>
    </HStack>
  </VStack>
));

export const Onramper = ({
  onEvent,
  onGdEvent,
  step,
  setStep,
  isTesting,
  apiKey,
  widgetParams = { onlyCryptos: "CUSD_CELO", isAddressEditable: false },
  targetNetwork = "CELO",
  targetWallet
}: {
  onEvent?: OnramperCallback;
  onGdEvent: (action: string) => void;
  step: number;
  setStep: (step: number) => void;
  isTesting: boolean;
  widgetParams?: any;
  targetWallet?: string;
  targetNetwork?: string;
  apiKey?: string;
}) => {
  const url = new URL("https://buy.onramper.com/");

  if (apiKey) {
    url.searchParams.set("apiKey", apiKey);
  }
  url.searchParams.set("networkWallets", `${targetNetwork}:${targetWallet}`);
  Object.entries(widgetParams).forEach(([k, v]: [string, any]) => {
    url.searchParams.append(k, v);
  });

  const { title } = useWindowFocus();

  const uri = url.toString();

  const isMobile = deviceDetect();

  // on page load check if a returning user is awaiting funds
  useEffect(() => {
    const isOnramping = async () => {
      const isOnramping = await AsyncStorage.getItem("gdOnrampSuccess");
      if (isOnramping === "true") {
        setStep(2);
      }
    };

    void isOnramping();
  }, []);

  useEffect(() => {
    if (title === "Onramper widget" && step === 0) {
      onGdEvent("buy_start");
      setStep(1);
    }
  }, [title, step]);

  const devNextStep = useCallback(() => {
    setStep(step + 1);
  }, [step]);

  const resetStep = useCallback(() => {
    setStep(0);
  }, [step]);

  if (!targetWallet) {
    return <></>;
  }

  return (
    <Box mb={6} alignItems="center">
      <Divider orientation="horizontal" w="100%" bg="borderGrey" mb={6} />
      <Stepper step={step} />
      <CentreBox maxWidth={420} w="100%" h={630} mb={6}>
        <WebView
          testID="onramper-widget-iframe-test"
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#58585f",
            borderStyle: "solid",
            margin: "auto"
          }}
          scrollEnabled={false}
          // injectedJavaScript={jsCode} // todo: add native/web webview implementation
          webviewDebuggingEnabled={true}
          source={{ uri }}
          onMessage={onEvent}
          height={630}
          width={420}
          title="Onramper widget"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
        ></WebView>
      </CentreBox>
      {isTesting && (
        <Box w={200} h={40} bg="primary" display="flex">
          <BaseButton
            bg="primary"
            _focus={{ bg: "primary" }}
            _hover={{ bg: "primary" }}
            w={200}
            h={20}
            onPress={devNextStep}
            text="Next step"
          />
          <BaseButton
            bg="primary"
            _focus={{ bg: "primary" }}
            _hover={{ bg: "primary" }}
            w="200"
            h="20"
            onPress={resetStep}
            text="Reset step"
          />
        </Box>
      )}
      {isMobile && <Divider orientation="horizontal" w="100%" bg="borderGrey" mb={6} />}
    </Box>
  );
};
