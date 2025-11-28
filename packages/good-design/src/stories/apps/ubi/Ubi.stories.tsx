import { Center, HStack, Text, VStack } from "native-base";
import { ClaimerTasksCard } from '../../../apps/usertasks/managerTaskCard';
import * as React from "react";
import { useCallback, useState } from "react";
import { useEthers } from "@usedapp/core";
import * as moment from "moment";
import { ethers } from "ethers";
import { G$Amount, GoodIdContextProvider, NewsFeedProvider, SupportedChains } from "@gooddollar/web3sdk-v2";
import { Provider } from "react-native-paper";

import { ClaimProvider, ClaimWizard, PostClaim, TransactionCard } from "../../../apps/ubi";

import { NativeBaseProvider, theme } from "../../../theme";
import { GoodIdProvider } from "../../../apps/goodid";
import { useGoodUILanguage } from "../../../theme";

import { W3Wrapper } from "../../W3Wrapper";
import { TxDetailsModal } from "../../../core/web3";
import { GoodButton } from "../../../core";

const explorerEndPoints = {
  CELO: "https://celo.blockscout.com/api?",
  FUSE: "https://explorer.fuse.io/api?",
  MAINNET: ""
};

export default {
  title: "Apps/Claim-Flow",
  component: ClaimWizard,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <NativeBaseProvider theme={theme} config={{ suppressColorAccessibilityWarning: true }}>
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

    const [showNextTasks, setShowNextTasks] = useState(false);
    const handleClaimSuccess = () => {
      setShowNextTasks(true);
    };

    return (
      //   {/* For testing purposes we have to be on qa env */}
      <GoodIdContextProvider>
        <Provider>
          <GoodIdProvider>
            <ClaimProvider
              activePoolAddresses={[
                // dev pools
                "0x77253761353271813c1aca275de8eec768b217c5",
                "0x627dbf00ce1a54067f5a34d6596a217a029c1532"
              ]}
              withSignModals
              explorerEndPoints={explorerEndPoints}
              supportedChains={[SupportedChains.CELO, SupportedChains.FUSE, SupportedChains.XDC]}
              onSuccess={handleClaimSuccess}
              {...args}
            >
               <VStack space={4}>
                <HStack>zz
                  <GoodButton onPress={() => setLanguage("en")} backgroundColor="gdPrimary" color="white" label="English" />
                  <GoodButton onPress={() => setLanguage("es-419")} backgroundColor="gdPrimary" color="white" label="spanish" />
                  <GoodButton
                    onPress={() => setShowNextTasks(!showNextTasks)}
                    backgroundColor="orange.500"
                    color="white"
                    label={showNextTasks ? "Hide Tasks" : "Show Tasks"}
                  />
                </HStack>
                {showNextTasks && (
                  <ClaimerTasksCard
                    onTaskComplete={(taskId) => console.log('Task completed:', taskId)}
                    onTaskDismiss={(taskId) => console.log('Task dismissed:', taskId)}
                  />
                )}
              </VStack>

              <ClaimWizard {...args} account={account} chainId={chainId} />
            </ClaimProvider>
          </GoodIdProvider>
        </Provider>
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
    onExit: () => {
      alert("If wallet > should go to dashboard");
    },
    simulateSuccess: false,
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
      <Provider>
        <VStack ml="auto" mr="auto" width="500" justifyContent="center" height="100vh">
          <TxDetailsModal open={openTxDetails} onClose={() => setOpenTxDetails(prev => !prev)} tx={args.transaction} />
          <TransactionCard {...args} onTxDetailsPress={onTxDetailsPress} />
        </VStack>
      </Provider>
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
