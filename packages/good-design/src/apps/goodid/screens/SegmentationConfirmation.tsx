import React from "react";
import { VStack, Text } from "native-base";
import { useIdentityExpiryDate, useIsAddressVerified } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useWizard } from "react-use-wizard";
import { useEthers } from "@usedapp/core";

import { Title } from "../../../core/layout";
import GoodIdCard from "../idcard/GoodIdCard";
import { GoodButton } from "../../../core/buttons";
import { withTheme } from "../../../theme";
import { LoaderModal } from "../../../core";

const SegmentationConfirmation = withTheme({ name: "SegmentationConfirmation" })(
  ({ styles, ...props }: { styles?: any }) => {
    const { nextStep } = useWizard();
    const { account } = useEthers();
    const [isWhitelisted] = useIsAddressVerified(account ?? "");
    const [expiryDate, , state] = useIdentityExpiryDate(account ?? "");
    const { innerContainer, button } = styles ?? {};

    return isWhitelisted === undefined || !account ? (
      <LoaderModal title={`We are creating \n your GoodID`} overlay="dark" loading={true} onClose={noop} />
    ) : (
      <VStack space={200} width={375} {...props}>
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
