import React from "react";
import { useEthers } from "@usedapp/core";
import { GoodIdContextProvider, useIdentityExpiryDate } from "@gooddollar/web3sdk-v2";
import { Text, VStack } from "native-base";
import { Wizard } from "react-use-wizard";

import { W3Wrapper } from "../../W3Wrapper";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

import { GoodIdCard } from "../../../apps/goodid";
import { OnboardScreen, SegmentationScreen as SegScreen } from "../../../apps/goodid/screens";
import { SegmentationController } from "../../../apps/goodid/controllers";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example
export const GoodIdCardExample = () => {
  const { account } = useEthers();
  const [expiryDate, , state] = useIdentityExpiryDate(account ?? "");

  return (
    <VStack width={375} space={4}>
      <Text variant="browse-wrap" fontSize="sm">
        For testing purposes. this card is using dev contracts
      </Text>
      <GoodIdCard
        account={account ?? "0x000...0000"}
        isWhitelisted={false}
        fullname="Just a name"
        expiryDate={state === "pending" ? "-" : expiryDate?.formattedExpiryTimestamp}
      />
    </VStack>
  );
};

export const SegmentationScreen = () => {
  const { account } = useEthers();
  return (
    <W3Wrapper withMetaMask={true}>
      <SegScreen account={account ?? ""} />
    </W3Wrapper>
  );
};

export const SegmentationFlow = () => (
  <W3Wrapper withMetaMask={true} env="staging">
    <VStack>
      <Text variant="browse-wrap" fontSize="sm">
        For testing purposes. this flow is using staging/QA contracts
      </Text>
      <SegmentationController />
    </VStack>
  </W3Wrapper>
);

export const OnboardScreenExample = () => {
  const { account } = useEthers();
  return <OnboardScreen account={account} />;
};

export const OffersAgreementExample = () => (
  <Wizard>
    <OffersAgreement />
  </Wizard>
);

export default {
  title: "Apps/GoodId",
  component: GoodIdCard,
  decorators: [
    (Story: any) => (
      <GoodIdWrapper>
        <W3Wrapper withMetaMask={true} env="fuse">
          <Story />
        </W3Wrapper>
      </GoodIdWrapper>
    )
  ],
  argTypes: {}
};
