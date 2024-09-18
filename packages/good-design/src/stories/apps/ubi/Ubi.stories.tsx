import { Center, HStack, Text, VStack } from "native-base";
import React, { useCallback, useState } from "react";
import { useEthers } from "@usedapp/core";
import moment from "moment";
import { ethers } from "ethers";
import { G$Amount, GoodIdContextProvider, NewsFeedProvider, SupportedChains } from "@gooddollar/web3sdk-v2";

import { ClaimProvider, ClaimWizard, PostClaim, TransactionCard } from "../../../apps/ubi";

import { NativeBaseProvider, theme } from "../../../theme";
import { GoodIdProvider } from "../../../apps/goodid";
import { useGoodUILanguage } from "../../../theme";

import { W3Wrapper } from "../../W3Wrapper";
import { TxDetailsModal } from "../../../core/web3";
import { GoodButton } from "../../../core";

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
      <W3Wrapper withMetaMask={true} env="staging">
        <NativeBaseProvider theme={theme}>
          <NewsFeedProvider env="qa" limit={1}>
            <VStack alignItems="center">
              <Story />
            </VStack>
          </NewsFeedProvider>
        </NativeBaseProvider>
      </W3Wrapper>
    )
  ]
};

export const ClaimFlow = {
  render: (args: any) => {
    const { setLanguage } = useGoodUILanguage();
    const { account = "", chainId } = useEthers();

    return (
      //   {/* For testing purposes we have to be on qa env */}
      <GoodIdContextProvider>
        <GoodIdProvider>
          <ClaimProvider
            withSignModals
            explorerEndPoints={explorerEndPoints}
            supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
            {...args}
          >
            <HStack>
              <GoodButton onPress={() => setLanguage("en")} backgroundColor="primary" color="white">
                English
              </GoodButton>
              <GoodButton onPress={() => setLanguage("es-419")} backgroundColor="primary" color="white">
                spanish
              </GoodButton>
            </HStack>

            <ClaimWizard {...args} account={account} chainId={chainId} />
          </ClaimProvider>
        </GoodIdProvider>
      </GoodIdContextProvider>
    );
  },
  args: {
    onNews: () => {
      alert("Should go to news page");
    },
    onUpgrade: () => {
      alert("Should go to goodid upgrade page");
    },
    isDev: true
  }
};

export const TransactionCardStory = {
  render: (args: any) => {
    const tokenValue = G$Amount("G$", ethers.BigNumber.from("1000000"), 122, "fuse");
    args.transaction.tokenValue = tokenValue;
    const [openTxDetails, setOpenTxDetails] = useState(false);

    const onTxDetailsPress = useCallback(() => {
      setOpenTxDetails(prev => !prev);
    }, [openTxDetails]);

    return (
      <VStack ml="auto" mr="auto" width="500" justifyContent="center" height="100vh">
        <TxDetailsModal open={openTxDetails} onClose={() => setOpenTxDetails(prev => !prev)} tx={args.transaction} />
        <TransactionCard {...args} onTxDetailsPress={onTxDetailsPress} />
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