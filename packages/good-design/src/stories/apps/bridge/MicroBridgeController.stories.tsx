import * as React from "react";
import { VStack } from "native-base";
import { MicroBridgeController } from "../../../apps/bridge/MicroBridgeController";
import { W3Wrapper } from "../../W3Wrapper";
import { SwitchChainModal } from "../../../core/web3/modals/SwitchChainModal";

export default {
  title: "Apps/MicroBridgeController",
  component: MicroBridgeController,
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
  // argTypes: {
  //   useBalanceHook: {
  //     description: "G$ Bridge"
  //   }
  // }
};

export const MicroBridgeControllerWithoutRelay = {
  args: { withRelay: false }
};
export const MicroBridgeControllerWithRelay = {
  args: { withRelay: true }
};
