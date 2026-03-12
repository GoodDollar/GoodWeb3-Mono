import React from "react";
import { VStack } from "native-base";
import { BridgingStatusBanner } from "../../../apps/bridge/mpbridge/BridgingStatusBanner";

export default {
  title: "Apps/MPBBridgeStatusStates",
  component: BridgingStatusBanner
};

const BannerTemplate = (args: { isBridging: boolean; bridgingStatus: string; isError?: boolean }) => (
  <VStack width="600" maxW="100%">
    <BridgingStatusBanner {...args} />
  </VStack>
);

export const AwaitingNetworkSwitch = {
  render: BannerTemplate,
  args: {
    isBridging: true,
    bridgingStatus: "Switching network. Please approve in your wallet..."
  }
};

export const AwaitingBridgeSignature = {
  render: BannerTemplate,
  args: {
    isBridging: true,
    bridgingStatus: "Please sign the bridge transaction in your wallet..."
  }
};

export const BridgeMining = {
  render: BannerTemplate,
  args: {
    isBridging: true,
    bridgingStatus: "Bridge transaction submitted. Waiting for confirmation..."
  }
};

export const Cancelled = {
  render: BannerTemplate,
  args: {
    isBridging: true,
    bridgingStatus: "Transaction cancelled"
  }
};

export const LongPending = {
  render: BannerTemplate,
  args: {
    isBridging: true,
    bridgingStatus: "Bridge request is still pending confirmation on-chain. This may take a few minutes..."
  }
};
