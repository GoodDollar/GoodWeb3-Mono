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
    idExpiry,
    styles,
    ...props
  }: IStackProps &
    Omit<
      SegmentationProps,
      "onDone" | "onLocationRequest" | "certificateSubjects" | "availableOffers" | "onDataPermission"
    > & {
      styles?: any;
    }) => {
    const { nextStep } = useWizard();
    const { expiryDate, state } = idExpiry ?? {};
    const { innerContainer, button } = styles ?? {};

    return isWhitelisted === undefined || !account ? (
      <LoaderModal title={`We are creating \n your GoodID`} overlay="dark" loading={true} onClose={noop} />
    ) : (
      <VStack space={200} width={"100%"} {...props}>
        <VStack space={6} {...innerContainer}>
          <Title variant="title-gdblue">Your GoodID is ready!</Title>
          <GoodIdCard
            account={account}
            isWhitelisted={isWhitelisted}
            expiryDate={state === "pending" ? "-" : expiryDate?.formattedExpiryTimestamp}
          />
          <Text variant="browse-wrap">
            You can always access this GoodID by connecting your current wallet to GoodDapp.
          </Text>
        </VStack>
        <VStack space={4} width={"100%"}>
          <GoodButton {...button} onPress={nextStep}>
            Next
          </GoodButton>
        </VStack>
      </VStack>
    );
  }
);

export default SegmentationConfirmation;
