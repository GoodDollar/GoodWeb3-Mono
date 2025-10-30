import React from "react";
import { W3Wrapper } from "../W3Wrapper";
import { useMPBBridgeLimits, useGetMPBBridgeData, useMPBBridgeHistory } from "../../sdk/mpbridge/react";

export interface PageProps {
  address: string;
  amount: number;
  chainId: number;
}

const MPBBridgeHooksTest = (params: PageProps) => {
  const limits = useMPBBridgeLimits(params.chainId, params.address, params.amount.toString());
  const bridgeInfo = useGetMPBBridgeData(params.chainId, params.address);
  const bridgeHistory = useMPBBridgeHistory();

  return (
    <>
      <pre>bridge nativeFee {bridgeInfo?.bridgeFees?.nativeFee?.toString()}</pre>
      <div>canBridge result: {JSON.stringify(limits)}</div>
      <pre>bridge data {JSON.stringify(bridgeInfo, null, 4)}</pre>
      <pre>bridge history {JSON.stringify(bridgeHistory, null, 4)}</pre>
    </>
  );
};

export default {
  title: "MPBBridge Hooks",
  component: MPBBridgeHooksTest,
  decorators: [
    Story => (
      <W3Wrapper withMetaMask={true}>
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {
    address: {
      description: "wallet address"
    },
    amount: {
      description: "bridge amount"
    },
    chainId: {
      description: "source chain"
    }
  },
  args: {
    address: "0x0",
    amount: 100,
    chainId: 122
  }
};

export const MPBBridge = {
  args: {
    address: "0x0",
    amount: 100,
    chainId: 122
  }
};
