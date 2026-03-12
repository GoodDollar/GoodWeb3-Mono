import * as React from "react";
import { VStack } from "native-base";
import { MPBBridgeController } from "../../../apps/bridge/mpbridge/MPBBridgeController";
import { W3Wrapper } from "../../W3Wrapper";
import { SwitchChainModal } from "../../../core/web3/modals/SwitchChainModal";

export default {
  title: "Apps/MPBBridgeController",
  component: MPBBridgeController,
  decorators: [
    (Story: any) => (
      <W3Wrapper withMetaMask={true} env="production">
        <SwitchChainModal>
          <VStack width="100%" alignItems="center">
            <Story />
          </VStack>
        </SwitchChainModal>
      </W3Wrapper>
    )
  ]
};

const defaultArgs = {
  withHistory: true,
  onBridgeStart: () => console.log("Bridge started"),
  onBridgeSuccess: () => console.log("Bridge succeeded"),
  onBridgeFailed: (error: Error) => console.log("Bridge failed:", error)
};

export const DesktopWidth = {
  render: (args: any) => (
    <VStack width="800" maxW="100%">
      <MPBBridgeController {...args} />
    </VStack>
  ),
  args: defaultArgs
};

export const MobileWidth = {
  render: (args: any) => (
    <VStack width="360" maxW="100%">
      <MPBBridgeController {...args} />
    </VStack>
  ),
  args: defaultArgs
};
