/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable @typescript-eslint/no-empty-function  */
import * as React from "react";
import { BridgeWizard } from "../../../apps/bridge/wizard/BridgeWizard";
import { W3Wrapper } from "../../W3Wrapper";

export default {
  title: "Apps/MicroBridge",
  component: BridgeWizard,
  decorators: [
    Story => (
      <W3Wrapper withMetaMask={true} env="fuse">
        <Story />
      </W3Wrapper>
    )
  ],
  argTypes: {
    useBalanceHook: {
      description: "G$ balance hook based on chain"
    }
  }
};

export const MicroBridgeStart = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => ({
      success: true,
      txHash: "0xbridge",
      relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
    }),
    relayStatus: undefined,
    bridgeStatus: undefined,
    originChain: ["celo", () => undefined]
  }
};

export const MicroBridgeSuccess = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => ({
      success: true,
      txHash: "0xbridge",
      relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
    }),
    selfRelayStatus: { status: "Fail" },
    bridgeStatus: { chainId: 122, status: "Success", transaction: { hash: "0xbridge" } },
    relayStatus: { chainId: 42220, status: "Success", transaction: { hash: "0xrelay" } },
    originChain: "celo"
  }
};
export const MicroBridgeError = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => ({ success: false, txHash: "0xbridgeerror" }),
    selfRelayStatus: { status: "None" },
    bridgeStatus: { chainId: 42220, status: "Fail", transaction: { hash: "0xbridgeerror" } },
    originChain: "celo"
  }
};
export const MicroRelayError = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => ({
      success: true,
      relayPromise: Promise.resolve({ success: false, txHash: "0xrelayerror" })
    }),
    bridgeStatus: { chainId: 122, status: "Success", transaction: { hash: "0xbridge" } },
    selfRelayStatus: { status: "Fail" },
    relayStatus: { chainId: 42220, status: "Fail", transaction: { hash: "0xrelayerror" } },
    originChain: "celo"
  }
};
export const MicroBridgeWaiting = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => new Promise(() => {}),
    bridgeStatus: { status: "Mining" },
    originChain: "celo"
  }
};
export const MicroBridgeWaitingRelay = {
  args: {
    useBalanceHook: (chain: string) => (chain === "fuse" ? 100 : 200),
    useCanBridge: (chain: string, amountWei: string) => ({ isValid: true, reason: "" }),
    onBridge: async () => ({ success: true, relayPromise: new Promise(() => {}) }),
    bridgeStatus: {
      status: "Success",
      transaction: { hash: "0xbridge353255353253253253253532535353532532535" },
      chainId: 122
    },
    relayStatus: { status: "Mining" },
    originChain: "celo"
  }
};
