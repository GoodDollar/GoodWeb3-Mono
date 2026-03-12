import React from "react";
import { Box, Text, VStack } from "native-base";
import { deriveMPBBridgeFlowState } from "../../sdk/mpbridge/flow/bridgeFlowState";

interface FlowStateStoryProps {
  status?: string;
  errorMessage?: string;
  isSwitchingChain?: boolean;
  approveHash?: string;
  currentHash?: string;
}

const FlowStatePreview = ({
  status,
  errorMessage,
  isSwitchingChain,
  approveHash,
  currentHash
}: FlowStateStoryProps) => {
  const flow = deriveMPBBridgeFlowState({
    bridgeStatus: {
      status,
      errorMessage,
      transaction: currentHash ? { hash: currentHash } : undefined
    },
    isSwitchingChain,
    previousTxHashes: approveHash ? { approve: approveHash } : undefined
  });

  return (
    <VStack space={3} p={4} bg="white" borderRadius="md" borderWidth={1} borderColor="coolGray.200">
      <Text fontSize="sm" color="coolGray.600">
        Input status: {status || "(none)"}
      </Text>
      <Text fontSize="sm" color="coolGray.600">
        Flow state: {flow.state}
      </Text>
      <Text fontSize="sm" color="coolGray.600">
        Label: {flow.statusLabel || "(empty)"}
      </Text>
      <Box bg="coolGray.50" p={3} borderRadius="sm">
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(flow, null, 2)}</pre>
      </Box>
    </VStack>
  );
};

export default {
  title: "MPBBridge/Flow States",
  component: FlowStatePreview
};

export const AwaitingNetworkSwitch = {
  args: {
    status: "PendingSignature",
    errorMessage: "Switch requested",
    isSwitchingChain: true
  }
};

export const AwaitingApprovalSignature = {
  args: {
    status: "PendingSignature",
    currentHash: "0xapprove"
  }
};

export const AwaitingBridgeSignature = {
  args: {
    status: "PendingSignature",
    approveHash: "0xapprove",
    currentHash: "0xbridge"
  }
};

export const BridgeMining = {
  args: {
    status: "Mining",
    approveHash: "0xapprove",
    currentHash: "0xbridge"
  }
};

export const Cancelled = {
  args: {
    status: "Fail",
    errorMessage: "User rejected transaction"
  }
};

export const Failed = {
  args: {
    status: "Exception",
    errorMessage: "Bridge fee not available"
  }
};

export const Success = {
  args: {
    status: "Success",
    approveHash: "0xapprove",
    currentHash: "0xbridge"
  }
};
