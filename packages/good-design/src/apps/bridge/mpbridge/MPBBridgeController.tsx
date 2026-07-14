import React from "react";
import { VStack } from "native-base";

import { MPBBridge } from "./MPBBridge";
import { useMPBBridgeFeatureController } from "./feature/useMPBBridgeFeatureController";
import type { MPBBridgeReadOnlyUrls } from "./types";

interface IMPBBridgeControllerProps {
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
  bridgeReadOnlyUrls?: MPBBridgeReadOnlyUrls;
}

export const MPBBridgeController: React.FC<IMPBBridgeControllerProps> = ({
  onBridgeStart,
  onBridgeSuccess,
  onBridgeFailed,
  bridgeReadOnlyUrls
}) => {
  const bridgeProps = useMPBBridgeFeatureController({
    onBridgeStart,
    onBridgeSuccess,
    onBridgeFailed,
    bridgeReadOnlyUrls
  });

  return (
    <VStack space={4} width="100%">
      <MPBBridge {...bridgeProps} />
    </VStack>
  );
};
