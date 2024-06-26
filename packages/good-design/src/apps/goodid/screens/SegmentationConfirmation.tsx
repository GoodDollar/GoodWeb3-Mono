import React from "react";
import { IStackProps, VStack, Text } from "native-base";

import { noop } from "lodash";
import { useWizard } from "react-use-wizard";

import { Title } from "../../../core/layout";
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
    Omit<SegmentationProps, "onDone" | "onLocationRequest" | "availableOffers" | "onDataPermission"> & {
      styles?: any;
    }) => {
    const { nextStep } = useWizard();
    const { innerContainer, button } = styles ?? {};

    return isWhitelisted === undefined || !account ? (
      <LoaderModal title={`We are creating \n your GoodID`} overlay="dark" loading={true} onClose={noop} />
    ) : (
      <VStack space={200} width={"100%"} {...props}>
        <VStack space={6} alignItems="center" {...innerContainer}>
          <Title variant="title-gdblue">Your GoodID is ready!</Title>
          <GoodIdCard
            certificateSubjects={props.certificateSubjects}
            account={account}
            isWhitelisted={isWhitelisted}
            expiryDate={expiryFormatted}
          />
          <Text variant="browse-wrap">
            You can always access this GoodID by connecting your current wallet to GoodDapp.
          </Text>
        </VStack>
        <VStack space={4} alignItems="center" width={"100%"}>
          <GoodButton width="343" {...button} onPress={nextStep}>
            Next
          </GoodButton>
        </VStack>
      </VStack>
    );
  }
);

export default SegmentationConfirmation;
