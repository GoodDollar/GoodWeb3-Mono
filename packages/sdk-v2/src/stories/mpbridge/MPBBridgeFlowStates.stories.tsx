import React from "react";
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
    <div
      style={{
        background: "white",
        border: "1px solid #d2d6dc",
        borderRadius: 8,
        padding: 16,
        display: "grid",
        gap: 12
      }}
    >
      <div style={{ fontSize: 14, color: "#4b5563" }}>Input status: {status || "(none)"}</div>
      <div style={{ fontSize: 14, color: "#4b5563" }}>Flow state: {flow.state}</div>
      <div style={{ fontSize: 14, color: "#4b5563" }}>Label: {flow.statusLabel || "(empty)"}</div>
      <div style={{ background: "#f9fafb", padding: 12, borderRadius: 4 }}>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(flow, null, 2)}</pre>
      </div>
    </div>
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
