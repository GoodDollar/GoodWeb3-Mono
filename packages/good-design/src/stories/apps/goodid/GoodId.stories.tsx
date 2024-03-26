import React from "react";

import { GoodIdCard } from "../../../apps/goodid";
import { W3Wrapper } from "../../W3Wrapper";
import { OffersAgreement } from "../../../apps/goodid/screens/OffersAgreement";

const mockCredential = [
  {
    credentialType: "VerifiableLocationCredential",
    verifiedValue: "US"
  },
  {
    credentialType: "VerifiableAgeCredential",
    verifiedValue: 24
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

export const OffersAgreementExample = () => <OffersAgreement />;

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
