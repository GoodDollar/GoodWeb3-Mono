import { Center, Text, VStack } from "native-base";
import React, { useCallback, useState } from "react";
import { ClaimProvider, ClaimWizard, PostClaim, TransactionCard } from "../../../apps/ubi";
import { G$Amount, SupportedChains } from "@gooddollar/web3sdk-v2";
import moment from "moment";
import { ethers } from "ethers";

import { W3Wrapper } from "../../W3Wrapper";
import { TxDetailsModal } from "../../../core/web3";

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
    const [openTxDetails, setOpenTxDetails] = useState(false);

    const onTxDetails = useCallback(() => {
      setOpenTxDetails(prev => !prev);
    }, [openTxDetails]);

    return (
      <VStack ml="auto" mr="auto" width="500" justifyContent="center" height="100vh">
        <TxDetailsModal open={openTxDetails} onClose={() => setOpenTxDetails(prev => !prev)} tx={args.transaction} />
        <TransactionCard {...args} onTxDetails={onTxDetails} />
      </VStack>
    );
  },
  args: {
    transaction: {
      address: "0x123",
      network: "CELO",
      contractAddress: "0x123",
      token: "G$",
      status: "not-started",
      type: "claim-confirmed",
      date: moment.utc(),
      displayName: "GoodDollar (0x123)",
      tokenValue: undefined,
      transactionHash: "0xTransactionHash"
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
