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
      <W3Wrapper withMetaMask={true} env="fuse">
        <SwitchChainModal>
          <VStack width="100%" alignItems={"center"}>
            <VStack width="800">
              <Story />
            </VStack>
          </VStack>
        </SwitchChainModal>
      </W3Wrapper>
    )
  ]
};

export const MPBBridgeControllerStory = {
  args: {
    withHistory: true,
    onBridgeStart: () => console.log("Bridge started"),
    onBridgeSuccess: () => console.log("Bridge succeeded"),
    onBridgeFailed: (error: Error) => console.log("Bridge failed:", error)
  }
};

// Also export with kebab-case name for compatibility
export const MPBBridgeControllerStoryKebab = MPBBridgeControllerStory;
