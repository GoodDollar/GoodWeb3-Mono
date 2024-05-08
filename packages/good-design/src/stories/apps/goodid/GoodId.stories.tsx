import React from "react";
import { useEthers } from "@usedapp/core";
import {
  GoodIdContextProvider,
  useAggregatedCertificates,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";
import { Text, VStack } from "native-base";
import { Wizard } from "react-use-wizard";

import { W3Wrapper } from "../../W3Wrapper";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

import { GoodIdCard } from "../../../apps/goodid";
import {
  DisputeThanks,
  OnboardScreen,
  SegmentationScreen as SegScreen,
  SegmentationConfirmation,
  SegmentationDispute
} from "../../../apps/goodid/screens";
import { SegmentationController } from "../../../apps/goodid/controllers";
import { useCertificatesMap } from "../../../hooks";

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
  const { account = "" } = useEthers();
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesMap(certificates);

  return (
    <W3Wrapper withMetaMask={true}>
      <SegScreen certificateSubjects={certificateSubjects} />
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

export const SegmentationConfirmationScreen = () => {
  const { account = "" } = useEthers();
  const [isWhitelisted] = useIsAddressVerified(account);
  const [expiryDate, , state] = useIdentityExpiryDate(account);

  return (
    <W3Wrapper withMetaMask={true}>
      <Wizard>
        <SegmentationConfirmation account={account} isWhitelisted={isWhitelisted} idExpiry={{ expiryDate, state }} />
      </Wizard>
    </W3Wrapper>
  );
};

export const SegmentationDisputeScreen = () => {
  const { account = "" } = useEthers();
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesMap(certificates);

  return (
    <W3Wrapper withMetaMask={true} env="staging">
      <Wizard>
        <VStack>
          <Text variant="browse-wrap" fontSize="sm">
            For testing purposes. this screen is using staging/QA contracts
          </Text>
          <SegmentationDispute
            certificateSubjects={certificateSubjects}
            onDispute={async disputedValues => {
              console.log("Following is to be reported to ga/amp:", { disputedValues });
            }}
          />
        </VStack>
      </Wizard>
    </W3Wrapper>
  );
};

export const DisputeThanksScreen = () => {
  return (
    <W3Wrapper withMetaMask={true}>
      <Wizard>
        <VStack width={343}>
          <DisputeThanks />
        </VStack>
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
