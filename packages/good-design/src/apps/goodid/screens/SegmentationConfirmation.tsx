import React from "react";
import { IStackProps, VStack } from "native-base";

import { noop } from "lodash";
import { useWizard } from "react-use-wizard";

import { TransText, TransTitle } from "../../../core/layout";
import GoodIdCard from "../components/GoodIdCard";
import { GoodButton } from "../../../core/buttons";
import { withTheme } from "../../../theme";
import { LoaderModal } from "../../../core";
import { SegmentationProps } from "../wizards";

const SegmentationConfirmation = withTheme({ name: "SegmentationConfirmation" })(
  ({
    account,
    isWhitelisted,
    expiryFormatted,
    styles,
    ...props
  }: IStackProps &
    Omit<SegmentationProps, "onDone" | "onLocationRequest" | "availableOffers" | "onDataPermission" | "withNavBar"> & {
      styles?: any;
    }) => {
    const { nextStep } = useWizard();
    const { innerContainer, button } = styles ?? {};

    return isWhitelisted === undefined || !account ? (
      <LoaderModal title={/*i18n*/ "We are creating \n your GoodID"} overlay="dark" loading={true} onClose={noop} />
    ) : (
      <VStack space={200} width={"100%"} {...props}>
        <VStack space={6} alignItems="center" {...innerContainer}>
          <TransTitle t={/*i18n*/ "Your GoodID is ready"} variant="title-gdblue" />
          <GoodIdCard
            certificateSubjects={props.certificateSubjects}
            account={account}
            isWhitelisted={isWhitelisted}
            expiryDate={expiryFormatted}
          />
          <TransText
            t={/*i18n*/ "You can always access this GoodID by connecting your current wallet to GoodDapp."}
            variant="browse-wrap"
          />
        </VStack>
        <VStack space={4} alignItems="center" width={"100%"}>
          <GoodButton width="343" {...button} onPress={nextStep}>
            <TransText t={/*i18n*/ "Next"} />
          </GoodButton>
        </VStack>
      </VStack>
    );
  }
);

export default SegmentationConfirmation;
