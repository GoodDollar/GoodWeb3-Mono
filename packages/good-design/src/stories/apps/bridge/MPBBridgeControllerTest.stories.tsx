import * as React from "react";
import { VStack, Text } from "native-base";
import { MPBBridgeController } from "../../../apps/bridge/mpbridge/MPBBridgeController";
import { W3Wrapper } from "../../W3Wrapper";
import { SwitchChainModal } from "../../../core/web3/modals/SwitchChainModal";

// Simple test component to debug loading issues
const MPBBridgeControllerDebug = () => {
  const [debugInfo, setDebugInfo] = React.useState("Initializing...");

  React.useEffect(() => {
    // Test the bridge API
    fetch("https://goodserver.gooddollar.org/bridge/estimatefees")
      .then(response => response.json())
      .then(data => {
        setDebugInfo(`API Response: ${JSON.stringify(data, null, 2)}`);
      })
      .catch(error => {
        setDebugInfo(`API Error: ${error.message}`);
      });
  }, []);

  return (
    <VStack space={4} width="100%">
      <Text>Debug Info:</Text>
      <Text fontSize="xs">{debugInfo}</Text>
      <MPBBridgeController
        onBridgeSuccess={() => console.log("Bridge succeeded")}
        onBridgeFailed={(error: Error) => console.log("Bridge failed:", error)}
      />
    </VStack>
  );
};

export default {
  title: "Apps/MPBBridgeController/Debug",
  component: MPBBridgeControllerDebug,
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

export const DebugTest = {
  args: {}
};
