import { Center, Spinner, VStack } from "native-base";
import React, { useEffect } from "react";
import { ClaimController, PostClaim, TransactionCard } from "../../../apps/ubi";
import { G$Amount, getRecentClaims } from "@gooddollar/web3sdk-v2";
import { CurrencyValue } from "@usedapp/core";
import moment from "moment";
import { ethers } from "ethers";

import { W3Wrapper } from "../../W3Wrapper";
import { useFormatClaimTransactions } from "../../../hooks";

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
  render: (args: any) => <ClaimController {...args} />,
  args: {
    explorerEndPoints: {
      CELO: "https://api.celoscan.io/api?apikey=WIX677MWRWNYWXTRCFKBK2NZAB2XHYBQ3K&",
      FUSE: "https://explorer.fuse.io/api?",
      MAINNET: ""
    }
  }
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
      tokenValue: G$Amount("G$", ethers.BigNumber.from("1000000"), 122, "fuse"),
      status: "not-started",
      type: "claim-start",
      date: moment().utc()
    },
    onTxDetails: async () => {
      alert(`Open Transaction Details`);
    }
  }
};

type ClaimPools = {
  totalAmount: CurrencyValue;
  transactionList: any[];
};

export const PostClaimStory = {
  render: (args: any) => {
    const { chainId, rpc, endpoints } = args.celo ? args.network.celo : args.network.fuse;
    const [claimPools, setClaimPools] = React.useState<any[]>([]);
    const formattedTransactionList = useFormatClaimTransactions(claimPools, chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    useEffect(() => {
      void (async () => {
        console.log("claimPools -->", { claimPools, formattedTransactionList });
        const recentClaims = await getRecentClaims(
          "0x3B7275C428c9B46D2c244E066C0bbadB9B9a8B9f",
          endpoints,
          provider
        ).then(res => res);
        setClaimPools(recentClaims);
      })();
    }, []);

    if (claimPools?.length === 0 || formattedTransactionList.length === 0) return <Spinner variant="page-loader" />;

    return (
      <Center>
        <PostClaim
          claimPools={formattedTransactionList as unknown as ClaimPools}
          onClaim={async () => {
            alert("claimed");
          }}
          onClaimFailed={async () => {
            alert("claimFailed");
          }}
          claimStats={{
            isWhitelisted: true,
            claimTime: new Date(),
            hasClaimed: true
          }}
        />
      </Center>
    );
  },
  args: {
    network: {
      celo: {
        rpc: "https://forno.celo.org",
        chainId: 42220,
        endpoints: "https://api.celoscan.io/api?"
      },
      fuse: {
        rpc: "https://rpc.fuse.io",
        chainId: 122,
        endpoints: "https://explorer.fuse.io/api?"
      }
    },
    celo: true
  }
};
