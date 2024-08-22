import { Center, Text, VStack } from "native-base";
import React from "react";
import { ClaimProvider, ClaimWizard, PostClaim, TransactionCard } from "../../../apps/ubi";
import { G$Amount, SupportedChains } from "@gooddollar/web3sdk-v2";
import moment from "moment";
import { ethers } from "ethers";

import { W3Wrapper } from "../../W3Wrapper";

const explorerEndPoints = {
  CELO: "https://api.celoscan.io/api?apikey=WIX677MWRWNYWXTRCFKBK2NZAB2XHYBQ3K&",
  FUSE: "https://explorer.fuse.io/api?",
  MAINNET: ""
};

export default {
  title: "Apps/Claim-Flow",
  component: ClaimWizard,
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
  render: (args: any) => {
    return (
      <ClaimProvider
        withSignModals
        explorerEndPoints={explorerEndPoints}
        supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
        {...args.args}
      >
        <ClaimWizard {...args} />
      </ClaimProvider>
    );
  },
  args: {
    onTxDetails: async (transaction: any) => {
      console.log({ transaction });
      alert(`Open Transaction Details`);
    }
  }
};

export const TransactionCardStory = {
  render: (args: any) => {
    const tokenValue = G$Amount("G$", ethers.BigNumber.from("1000000"), 122, "fuse");
    args.transaction.tokenValue = tokenValue;
    return (
      <VStack ml="auto" mr="auto" width="500" justifyContent="center" height="100vh">
        <TransactionCard {...args} />
      </VStack>
    );
  },
  args: {
    transaction: {
      network: "CELO",
      contractAddr: "0x123",
      token: "G$",
      status: "not-started",
      type: "claim-start",
      date: moment.utc().format()
    },
    onTxDetails: async () => {
      alert(`Open Transaction Details`);
    }
  }
};

export const PreClaimStoryUI = {
  render: (args: any) => (
    <Center>
      <ClaimWizard {...args} />
    </Center>
  )
};

export const PostClaimUI = {
  render: (args: any) => (
    <Center>
      <Text fontWeight="bold" marginBottom="2">
        This is a demo, if timer is 0, make sure you do the PreClaim story-example first.
      </Text>
      <PostClaim {...args} />
    </Center>
  )
};
