import React, { useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { TouchableOpacity } from "react-native";
import { ArrowBackIcon, View } from "native-base";

import { ErrorModal } from "../../../core/web3";
import { TransText } from "../../../core/layout";

export const WizardHeader = ({
  onDone,
  withNavBar,
  error,
  onClose,
  stepHistory,
  ...props
}: {
  onDone: (error?: Error) => Promise<void>;
  withNavBar: boolean;
  error: any;
  stepHistory?: number[];
  onClose?: any;
}) => {
  const { activeStep, isFirstStep, isLastStep, goToStep, previousStep } = useWizard();

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      void onDone();
      return;
    }

    //wip. alternative flow needed for segmentation flow
    if (stepHistory) {
      const hasDisputed = [1, 2].some(value => stepHistory.includes(value));

      if (activeStep === 3 && !hasDisputed) {
        goToStep(0);
        return;
      }

      if (activeStep === 4 && hasDisputed) {
        goToStep(2);
        return;
      }
    }

    previousStep();
  }, [isFirstStep, stepHistory]);

  return (
    <>
      {error ? <ErrorModal error={error} onClose={onClose ?? (() => goToStep(0))} overlay="dark" /> : null}
      {withNavBar ? (
        <View
          bg="primary"
          justifyContent={"center"}
          alignItems={"center"}
          height={12}
          flexDir={"row"}
          width="100%"
          paddingLeft={isFirstStep || isLastStep ? 0 : 4}
          paddingRight={4}
          mb={6}
          {...props}
        >
          <View position={"relative"} display={"inline"} width={15}>
            <TouchableOpacity onPress={handleBack}>
              {isLastStep || isFirstStep ? null : <ArrowBackIcon color="white" />}
            </TouchableOpacity>
          </View>

          <View flex={"auto"} flexDirection={"row"} justifyContent={"center"}>
            <TransText
              t={"GoodID"}
              color="white"
              fontFamily="subheading"
              fontSize="sm"
              fontWeight="500"
              lineHeight={19}
            />
          </View>
        </View>
      ) : null}
    </>
  );
};
