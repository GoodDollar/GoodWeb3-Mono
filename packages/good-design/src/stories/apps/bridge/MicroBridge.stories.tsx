import React from "react";
import { MicroBridge } from "../../../apps/bridge/MicroBridge";

export default {
  title: "Apps/MicroBridge",
  component: MicroBridge,
  argTypes: {
    useBalanceHook: {
      description: "G$ balance hook based on chain"
    }
  }
};

export const MicroBridgeStart = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => ({
      success: true,
      txHash: "0xbridge",
      relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
    }),
    relayStatus: undefined,
    bridgeStatus: undefined
  }
};

export const MicroBridgeSuccess = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => ({
      success: true,
      txHash: "0xbridge",
      relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
    }),
    bridgeStatus: { status: "Success", transaction: { hash: "0xbridge" } },
    relayStatus: { status: "Success", transaction: { hash: "0xrelay" } }
  }
};
export const MicroBridgeError = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => ({ success: false, txHash: "0xbridgeerror" }),
    bridgeStatus: { status: "Fail", transaction: { hash: "0xbridgeerror" } }
  }
};
export const MicroRelayError = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => ({
      success: true,
      relayPromise: Promise.resolve({ success: false, txHash: "0xrelayerror" })
    }),
    bridgeStatus: { status: "Success", transaction: { hash: "0xbridge" } },
    relayStatus: { status: "Fail", transaction: { hash: "0xrelayerror" } }
  }
};
export const MicroBridgeWaiting = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => new Promise(() => {}),
    bridgeStatus: { status: "Mining" }
  }
};
export const MicroBridgeWaitingRelay = {
  args: {
    useBalanceHook: chain => (chain === "fuse" ? 100 : 200),
    onBridge: async () => ({ success: true, relayPromise: new Promise(() => {}) }),
    bridgeStatus: { status: "Success", transaction: { hash: "0xbridge" } },
    relayStatus: { status: "Mining" }
  }
};
