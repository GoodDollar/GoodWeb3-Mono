import { VStack } from "native-base";
import React from "react";
import { ClaimController, TransactionCard } from "../../../apps/ubi";
import { W3Wrapper } from "../../W3Wrapper";

export default {
  title: "Apps/Claim-Flow",
  component: ClaimController,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <VStack alignItems="center">
          <Story />
        </VStack>
      </W3Wrapper>
    )
  ]
};

export const ClaimFlow = {
  args: {}
};

export const TransactionCardStory = {
  render: (args: any) => (
    <VStack ml="auto" mr="auto" width="500" justifyContent="center" height="100vh">
      <TransactionCard {...args} />
    </VStack>
  ),
  args: {
    transaction: {
      network: "CELO",
      contractAddr: "0x123",
      token: "G$",
      tokenValue: "1.000.000",
      status: "not-started",
      type: "claim-start",
      date: new Date().toDateString()
    },
    onTxDetails: async () => {
      alert(`Open Transaction Details`);
    }
  }
};
