import React, { useCallback, useEffect } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Box, Circle, HStack, Stack, Text, VStack } from "native-base";

import { CentreBox } from "../../core/layout/CentreBox";
import { AnimatedProgress } from "../../core/animated";
import { Divider } from "native-base";

export type OnramperCallback = (event: WebViewMessageEvent) => void;

// reminder: should be default 0
const StepsProgress = ({ step }: { step: number }) => {
  const stepPercentages: { [key: number]: number } = {
    1: 50, // succesfully bought
    2: 50, // amount received in sc-wallet
    3: 100 // swapping to GD
  };

  const value = stepPercentages[step];

  return (
    <HStack w="90%" position="absolute" left="30px" display="flex" justifyContent="center">
      <CentreBox h="50px" w="238" position="absolute">
        <AnimatedProgress value={value} step={step} />
      </CentreBox>
    </HStack>
  );
};

const Stepper = ({ step = -1 }) => (
  <VStack direction={"row"} mb={6} justifyContent="center" justifyItems="center" position="relative">
    <StepsProgress step={step} />
    <HStack alignItems="center" h="70px" justifyContent="space-between" w="300">
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="40px" bgColor={step >= 0 ? "primary" : "goodGrey.300"}>
          <Text color={step >= 0 ? "white" : "goodGrey.700"}> 1 </Text>
        </Circle>
        <Text color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          Buy CELO
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="40px" bgColor={step < 2 ? "goodGrey.300" : "primary"}>
          <Text color={step < 2 ? "goodGrey.700" : "white"}> 2 </Text>
        </Circle>
        <Text w="112px" color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          We swap CELO to G$
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="40px" bgColor={step <= 3 ? "goodGrey.300" : "primary"}>
          <Text color={step <= 3 ? "goodGrey.700" : "white"}> 3 </Text>
        </Circle>
        <Text color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          Done
        </Text>
      </Stack>
    </HStack>
  </VStack>
);

export const Onramper = ({
  onEvent,
  step,
  setStep,
  widgetParams = { onlyCryptos: "CUSD_CELO", isAddressEditable: false },
  targetNetwork = "CELO",
  targetWallet
}: {
  onEvent?: OnramperCallback;
  step: number;
  setStep: (step: number) => void;
  widgetParams?: any;
  targetWallet?: string;
  targetNetwork?: string;
}) => {
  const handleEvents = useCallback((event: WebViewMessageEvent) => {
    console.log("onramper event from webview:", event);
    onEvent && onEvent(event);
  }, []);

  const uri = `https://buy.onramper.com/?networkWallets=${targetNetwork}:${targetWallet}&${Object.entries(widgetParams)
    .map(([k, v]) => `${k}=${v}`)
    .join("&")}`;

  const startStepper = useCallback(() => {
    if (step === -1) {
      setStep(0);
    }
  }, [step]);

  useEffect(() => {
    window.focus(); // first force  focus for the step animation to start properly
  }, []);

  // SO fiddle: http://jsfiddle.net/wk1yv6q3/
  useEffect(() => {
    const checkFocus = (e: any) => {
      console.log("checkFocus", { e, step });
      if (document.activeElement === document.querySelector("iframe")) {
        startStepper();
      } else if (step === 0) {
        setStep(-1);
      }
    };
    window.addEventListener("focus", checkFocus);
    window.addEventListener("blur", checkFocus);
    return () => {
      window.removeEventListener("blur", checkFocus);
      window.removeEventListener("focus", checkFocus);
    };
  }, [step]);

  const devNextStep = useCallback(() => {
    console.log("devNextStep", { step });
    setStep(step + 1);
  }, [step]);

  const resetStep = useCallback(() => {
    setStep(-1);
  }, [step]);

  if (!targetWallet) {
    return <></>;
  }

  return (
    <Box mb={6}>
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
          onMessage={handleEvents}
          height="630px"
          width="420px"
          title="Onramper widget"
          allow="accelerometer; autoplay; camera; gyroscope; payment"
        ></WebView>
      </CentreBox>
      {/* Comment out below for testing in onramp story */}
      {/* <Box w="200" h="40" bg="primary" display="flex">
        <BaseButton
          bg="primary"
          _focus={{ bg: "primary" }}
          _hover={{ bg: "primary" }}
          w="200"
          h="20"
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
      </Box> */}
      <Divider orientation="horizontal" w="100%" bg="borderGrey" mb={6} />
    </Box>
  );
};