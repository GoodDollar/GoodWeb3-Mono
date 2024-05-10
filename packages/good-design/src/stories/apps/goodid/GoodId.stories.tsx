import React from "react";
import { Meta } from "@storybook/react";
import { useEthers } from "@usedapp/core";
import {
  GoodIdContextProvider,
  useAggregatedCertificates,
  useCertificatesSubject,
  useIdentityExpiryDate
} from "@gooddollar/web3sdk-v2";
import { Spinner, Text, VStack } from "native-base";
import { Wizard } from "react-use-wizard";

import { W3Wrapper } from "../../W3Wrapper";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

import { GoodIdCard } from "../../../apps/goodid";
import { OnboardScreen, SegmentationScreen as SegScreen, SegmentationConfirmation } from "../../../apps/goodid/screens";
import { SegmentationController, OnboardController } from "../../../apps/goodid/controllers";
import { isNull } from "lodash";

const GoodIdWrapper = ({ children }) => {
  return <GoodIdContextProvider>{children}</GoodIdContextProvider>;
};

//todo: add expiration date utilty example

export const GoodIdCardExample = () => {
  const { account = "" } = useEthers();
  const [expiryDate, , state] = useIdentityExpiryDate(account);
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesSubject(certificates);

  if (isNull(certificates) || !account || state === "pending") return <Spinner variant="page-loader" size="lg" />;

  return (
    <VStack width={375} space={4}>
      <Text variant="browse-wrap" fontSize="sm">
        For testing purposes. this card is using dev contracts
      </Text>
      <GoodIdCard
        certificateSubjects={certificateSubjects}
        account={account ?? "0x000...0000"}
        isWhitelisted={false}
        fullname="Just a name"
        expiryDate={expiryDate?.formattedExpiryTimestamp}
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

export const OnboardScreenExample = {
  render: args => {
    const { account = "" } = useEthers();
    return <OnboardScreen width={375} account={account} onAccept={() => alert("onAccept")} {...args} />;
  },
  args: {
    name: "test user",
    isWhitelisted: true,
    account: "0x066",
    isPending: false,
    hasCertificates: false,
    expiryDate: new Date().toISOString()
  }
};

export const OnboardControllerExample: Meta<React.ComponentProps<typeof OnboardController>> = {
  decorators: [
    (Story: any) => {
      console.log("HERE");
      return (
        <GoodIdWrapper>
          <W3Wrapper withMetaMask={true} env="fuse">
            <Story />
          </W3Wrapper>
        </GoodIdWrapper>
      );
    }
  ],
  render: args => {
    const { account } = useEthers();
    console.log({ account });
    args.account = account || args.account;
    return <OnboardController {...args} />;
  },
  args: {
    account: "0x5128E3C1f8846724cc1007Af9b4189713922E4BB",
    name: "testuser",
    onFV: () => alert("onFV"),
    onSkip: () => alert("Already verified, should go to claim-page"),
    width: 475
  }
};

export const OffersAgreementExample = () => (
  <Wizard>
    <OffersAgreement />
  </Wizard>
);

export const SegmentationConfirmationScreen = () => {
  return (
    <W3Wrapper withMetaMask={true}>
      <Wizard>
        <SegmentationConfirmation />
      </Wizard>
    </W3Wrapper>
  );
};

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
