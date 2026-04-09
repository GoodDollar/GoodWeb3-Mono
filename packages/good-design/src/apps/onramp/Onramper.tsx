import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Box, Circle, HStack, Stack, Text, VStack, useBreakpointValue } from "native-base";
import { AsyncStorage, isMobile as deviceDetect } from "@gooddollar/web3sdk-v2";

import { CentreBox } from "../../core/layout/CentreBox";
import { AnimatedProgress } from "../../core/animated";
import { Divider } from "native-base";
import { BaseButton } from "../../core";
import { useWindowFocus } from "../../hooks";

export type OnramperCallback = (event: WebViewMessageEvent) => void;
const SENSITIVE_WIDGET_PARAMS = ["wallets", "walletAddressTags", "networkWallets"] as const;
type SensitiveWidgetParam = (typeof SENSITIVE_WIDGET_PARAMS)[number];
type WidgetParams = Record<string, string | number | boolean | undefined>;

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
        <Circle size="10" bgColor={step > 0 ? "gdPrimary" : "goodGrey.300"}>
          <Text color={step > 0 ? "white" : "goodGrey.700"}> 1 </Text>
        </Circle>
        <Text color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          Buy cUSD
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="10" bgColor={step <= 2 ? "goodGrey.300" : "gdPrimary"}>
          <Text color={step <= 2 ? "goodGrey.700" : "white"}> 2 </Text>
        </Circle>
        <Text w="112" color="goodGrey.700" fontFamily="subheading" fontWeight={400} fontSize="2xs">
          We swap cUSD to G$
        </Text>
      </Stack>
      <Stack width={"1/3"} alignItems={"center"}>
        <Circle size="10" bgColor={step < 5 ? "goodGrey.300" : "gdPrimary"}>
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
  urlSignature,
  onUrlSignContentReady,
  widgetParams = { onlyCryptos: "CUSD_CELO", isAddressEditable: false },
  targetNetwork = "CELO",
  targetWallet
}: {
  onEvent?: OnramperCallback;
  onGdEvent: (action: string) => void;
  step: number;
  setStep: (step: number) => void;
  isTesting: boolean;
  widgetParams?: WidgetParams;
  targetWallet?: string;
  targetNetwork?: string;
  apiKey?: string;
  urlSignature?: string;
  onUrlSignContentReady?: (signContent: string) => void;
}) => {
  /**
   * Onramper URL-signing guide:
   * - sort nested mapping keys alphabetically (e.g. "bitcoin:...,ethereum:...")
   * - keep values unencoded while preparing signContent
   */
  const sortNestedMappingValueAlphabetically = useCallback((value: string) => {
    return value
      .split(",")
      .filter(Boolean)
      .map(entry => entry.trim())
      .filter(Boolean)
      .map(entry => {
        const [rawKey, ...rawRest] = entry.split(":");
        if (!rawKey || rawRest.length === 0) return undefined;
        return [rawKey.trim().toLowerCase(), rawRest.join(":").trim()] as const;
      })
      .filter((pair): pair is readonly [string, string] => Boolean(pair))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, mappedValue]) => `${key}:${mappedValue}`)
      .join(",");
  }, []);

  const sensitiveParamsForSigning = useMemo(() => {
    const params: Partial<Record<SensitiveWidgetParam, string>> = {};

    if (targetWallet) {
      params.networkWallets = `${targetNetwork.toLowerCase()}:${targetWallet}`;
    }

    SENSITIVE_WIDGET_PARAMS.forEach(paramKey => {
      const widgetValue = widgetParams[paramKey];
      if (widgetValue !== undefined) {
        params[paramKey] = String(widgetValue);
      }
    });

    SENSITIVE_WIDGET_PARAMS.forEach(paramKey => {
      const sensitiveValue = params[paramKey];
      if (sensitiveValue) {
        params[paramKey] = sortNestedMappingValueAlphabetically(sensitiveValue);
      }
    });

    return params;
  }, [sortNestedMappingValueAlphabetically, targetNetwork, targetWallet, widgetParams]);

  /**
   * Onramper URL-signing guide:
   * - signContent is ONLY sensitive params subset:
   *   wallets, networkWallets, walletAddressTags
   * - sort top-level keys alphabetically
   * - keep this string unencoded before signing
   */
  const signContent = useMemo(() => {
    return Object.entries(sensitiveParamsForSigning)
      .filter(([, value]) => Boolean(value))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }, [sensitiveParamsForSigning]);

  useEffect(() => {
    if (onUrlSignContentReady && signContent) {
      onUrlSignContentReady(signContent);
    }
  }, [signContent, onUrlSignContentReady]);

  // Memoize URL construction to avoid reconstruction on every render
  const uri = useMemo(() => {
    const url = new URL("https://buy.onramper.com/");

    // Always include API key for proper authentication
    // SECURITY NOTE: Onramper API keys are designed for client-side use
    // - These are PUBLIC API keys specifically intended for browser environments
    // - They are NOT secret keys and are safe to expose in client-side code
    // - Similar to Google Maps API keys, they're restricted by domain/referrer
    // - This follows Onramper's official integration documentation
    // - See: https://docs.onramper.com for official security guidelines
    if (apiKey) {
      url.searchParams.set("apiKey", apiKey);
    } else {
      console.warn("Onramper: No API key provided");
    }
    Object.entries(sensitiveParamsForSigning).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    Object.entries(widgetParams).forEach(([k, v]: [string, any]) => {
      if (v !== undefined && !SENSITIVE_WIDGET_PARAMS.includes(k as SensitiveWidgetParam)) {
        url.searchParams.set(k, String(v));
      }
    });

    if (urlSignature) {
      url.searchParams.set("signature", urlSignature);
    } else if (signContent) {
      console.warn(
        "Onramper: Sensitive wallet params are present but no urlSignature was provided. Checkout may be restricted."
      );
    }

    return url.toString();
  }, [apiKey, sensitiveParamsForSigning, signContent, widgetParams, urlSignature]);

  const { title } = useWindowFocus();
  const shouldWaitForSignature = Boolean(signContent) && !urlSignature;

  // Cache AsyncStorage value to avoid repeated reads
  const [cachedOnrampStatus, setCachedOnrampStatus] = useState<string | null>(null);

  const isMobile = deviceDetect();

  // Responsive dimensions for the widget
  const widgetDimensions = useBreakpointValue({
    base: {
      maxWidth: "100%",
      width: "95vw",
      height: 500,
      webViewWidth: "100%",
      webViewHeight: 500
    },
    sm: {
      maxWidth: 400,
      width: "90%",
      height: 550,
      webViewWidth: 380,
      webViewHeight: 550
    },
    md: {
      maxWidth: 450,
      width: "80%",
      height: 600,
      webViewWidth: 430,
      webViewHeight: 600
    },
    lg: {
      maxWidth: 480,
      width: "100%",
      height: 630,
      webViewWidth: 480,
      webViewHeight: 630
    },
    xl: {
      maxWidth: 480,
      width: "200%",
      height: 630,
      webViewWidth: 480,
      webViewHeight: 630
    }
  });

  // on page load check if a returning user is awaiting funds
  // Cache the value to avoid repeated AsyncStorage reads
  useEffect(() => {
    const isOnramping = async () => {
      if (cachedOnrampStatus === null) {
        const status = await AsyncStorage.getItem("gdOnrampSuccess");
        setCachedOnrampStatus(status);
        if (status === "true") {
          setStep(2);
        }
      }
    };

    void isOnramping();
  }, [cachedOnrampStatus]);

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
    return (
      <Box p="4" textAlign="center" color="red.500">
        Wallet not found. Please select a valid wallet to continue.
      </Box>
    );
  }

  return (
    <Box mb={6} alignItems="center" w="100%">
      <Divider orientation="horizontal" w="100%" bg="borderGrey" mb={6} />
      <Stepper step={step} />
      <CentreBox maxWidth={widgetDimensions?.maxWidth} w={widgetDimensions?.width} h={widgetDimensions?.height} mb={6}>
        {shouldWaitForSignature ? (
          <CentreBox
            borderRadius={4}
            borderWidth={1}
            borderColor="#58585f"
            borderStyle="solid"
            w="100%"
            h="100%"
            px={4}
          >
            <Text textAlign="center" color="goodGrey.700" fontFamily="subheading">
              Preparing secure checkout...
            </Text>
          </CentreBox>
        ) : (
          <WebView
            testID="onramper-widget-iframe-test"
            style={{
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#58585f",
              borderStyle: "solid",
              margin: "auto",
              width: "100%",
              height: "100%"
            }}
            scrollEnabled={false}
            // injectedJavaScript={jsCode} // todo: add native/web webview implementation
            webviewDebuggingEnabled={true}
            source={{ uri }}
            onMessage={onEvent}
            onError={syntheticEvent => {
              const { nativeEvent } = syntheticEvent;
              console.error("Onramper WebView error:", nativeEvent);
            }}
            onHttpError={syntheticEvent => {
              const { nativeEvent } = syntheticEvent;
              console.error("Onramper HTTP error:", nativeEvent.statusCode, nativeEvent.description);
            }}
            height={widgetDimensions?.webViewHeight}
            width={widgetDimensions?.webViewWidth}
            title="Onramper widget"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
          ></WebView>
        )}
      </CentreBox>
      {isTesting && (
        <Box w={200} h={40} bg="gdPrimary" display="flex">
          <BaseButton
            bg="gdPrimary"
            _focus={{ bg: "gdPrimary" }}
            _hover={{ bg: "gdPrimary" }}
            w={200}
            h={20}
            onPress={devNextStep}
            text="Next step"
          />
          <BaseButton
            bg="gdPrimary"
            _focus={{ bg: "gdPrimary" }}
            _hover={{ bg: "gdPrimary" }}
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
