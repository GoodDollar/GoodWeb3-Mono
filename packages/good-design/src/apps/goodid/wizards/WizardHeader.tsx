import React, { useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { ArrowBackIcon, Pressable, View } from "native-base";

import { ErrorModal } from "../../../core/web3";
import { TransText } from "../../../core/layout";

/* Step Reference 
## Segmentation
0. SegmentationScreen
1. SegmentationDispute
2. SegmentationThanks
3. OffersAgreement
4. SegmentationConfirmation
*/

export const WizardHeader = ({
  onDone,
  withNavBar,
  error,
  onClose,
  stepHistory,
  onExit,
  ...props
}: {
  onDone: (error?: Error) => Promise<void>;
  withNavBar: boolean;
  error: any;
  stepHistory?: number[];
  onClose?: any;
  onExit?: () => void;
}) => {
  const { activeStep, isFirstStep, isLastStep, stepCount, goToStep, previousStep } = useWizard();

  const handleBack = useCallback(() => {
    if (onExit) {
      onExit();
      return;
    }

    if (isFirstStep) {
      void onDone();
      return;
    }

    //wip. alternative flow needed for segmentation flow
    if (stepHistory) {
      const hasDisputed = [2].some(value => stepHistory.includes(value));

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
          paddingLeft={isLastStep && stepCount > 1 ? 0 : 4}
          paddingRight={4}
          mb={6}
          {...props}
        >
          <View position={"relative"} display={"flex"} width={15}>
            <Pressable onPress={handleBack}>
              {(isLastStep && stepCount > 1) || // handling wizard with only one step where first/last is equal (eg. onboardwizard)
              (isFirstStep && !onExit) || // no onExit handler, user has to finish flow to exit
              // for segmentation:
              // if user disputes, we don't want the user to navigate back from DisputeThanks
              (stepHistory && [1, 2].some(value => stepHistory.includes(value)) && activeStep === 2) ? null : (
                <ArrowBackIcon color="white" />
              )}
            </Pressable>
          </View>

          <View flex={1} flexDirection={"row"} justifyContent={"center"}>
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
