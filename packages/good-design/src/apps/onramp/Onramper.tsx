import React, { useCallback } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Box, CheckCircleIcon, Circle, Spinner, Stack, Text } from "native-base";
export type OnramperCallback = (event: WebViewMessageEvent) => void;

const Stepper = ({ step = -1 }) => (
  <Stack direction={"row"} justifyContent={"space-between"} justifyItems={"center"}>
    <Stack width={"1/4"} alignItems={"center"}>
      <Circle size="40px" bgColor={step <= 0 ? "red.100" : "green.100"}>
        {step === 0 && <Spinner color="emerald.500" />}
        {step > 0 && <CheckCircleIcon />}
      </Circle>
      <Text>Recieving Celo/CUSD...</Text>
    </Stack>
    <Stack width={"1/4"} alignItems={"center"}>
      <Circle size="40px" bgColor={step <= 1 ? "red.100" : "green.100"}>
        {step === 1 && <Spinner color="emerald.500" />}
        {step > 1 && <CheckCircleIcon />}
      </Circle>
      <Text>Sending Transaction...</Text>
    </Stack>
    <Stack width={"1/4"} alignItems={"center"}>
      <Circle size="40px" bgColor={step <= 1 ? "red.100" : "green.100"}>
        {step === 2 && <Spinner color="emerald.500" />}
        {step > 2 && <CheckCircleIcon />}
      </Circle>
      <Text>Exchanging to G$...</Text>
    </Stack>
    <Stack width={"1/4"} alignItems={"center"}>
      <Circle size="40px" bgColor={step < 2 ? "red.100" : "green.100"}>
        {step > 2 && <CheckCircleIcon />}
      </Circle>
      <Text>Done</Text>
    </Stack>
  </Stack>
);

export const Onramper = ({
  onEvent,
  step,
  widgetParams = { onlyCryptos: "CELO_CELO,CUSD_CELO", isAddressEditable: false },
  targetNetwork = "CELO",
  targetWallet
}: {
  onEvent?: OnramperCallback;
  step?: number;
  widgetParams?: any;
  targetWallet?: string;
  targetNetwork?: string;
}) => {
  const handleEvents = useCallback((event: WebViewMessageEvent) => {
    console.log("onramper event from webview:", event);
    onEvent && onEvent(event);
  }, []);

  if (!targetWallet) {
    return <></>;
  }
  const uri = `https://buy.onramper.com/?networkWallets=${targetNetwork}:${targetWallet}&${Object.entries(widgetParams)
    .map(([k, v]) => `${k}=${v}`)
    .join("&")}`;

  // console.log({ targetNetwork, targetWallet, uri });
  return (
    <Box height={630} width={420}>
      <WebView
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "#58585f",
          borderStyle: "solid",
          margin: "auto"
        }}
        source={{ uri }}
        onMessage={handleEvents}
        height="630px"
        width="420px"
        title="Onramper widget"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
      ></WebView>
      <Stepper step={step} />
    </Box>
  );
};
