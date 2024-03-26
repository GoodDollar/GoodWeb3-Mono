import React from "react";

import { W3Wrapper } from "../../W3Wrapper";

import { GoodIdCard } from "../../../apps/goodid";
import { SegmentationScreen } from "../../../apps/goodid/screens";

const mockCredential = [
  {
    credentialType: "VerifiableLocationCredential",
    verifiedValue: "US"
  },
  {
    credentialType: "VerifiableAgeCredential",
    verifiedValue: "24-29"
  }
];

//todo: add expiration date utilty example
export const GoodIdCardExample = () => (
  <GoodIdCard
    credentialsList={mockCredential}
    account="0x000...0000"
    isWhitelisted={false}
    fullname="Just a name"
    expiryDate="Expires on April 12, 2023"
  />
);

export const SegmentationFlow = () => {
  return (
    <W3Wrapper withMetaMask={true}>
      <SegmentationScreen />
    </W3Wrapper>
  );
};

export default {
  title: "Apps/GoodId",
  component: GoodIdCardExample,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {}
};
