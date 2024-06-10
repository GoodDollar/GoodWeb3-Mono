import React, { useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { TouchableOpacity } from "react-native";
import { ArrowBackIcon, Text, View } from "native-base";

import { ErrorModal } from "../../../core/web3";

export const WizardHeader = ({
  onDone,
  error,
  onClose,
  ...props
}: {
  onDone: (error?: Error) => Promise<void>;
  error: any;
  onClose?: any;
}) => {
  const { isFirstStep, previousStep, isLastStep, goToStep } = useWizard();

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      void onDone();
      return;
    }
    previousStep();
  }, [isFirstStep]);

  return error ? (
    <ErrorModal error={error} onClose={onClose ?? (() => goToStep(0))} overlay="dark" />
  ) : (
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
        <Text color="white" fontFamily="subheading" fontSize="sm" fontWeight="500" lineHeight={19}>
          GoodID
        </Text>
      </View>
    </View>
  );
};
