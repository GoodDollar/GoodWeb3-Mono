// Button.stories.js
import React from "react";
import MPB from "../../../apps/MBP/MPB";

export default {
  title: "Components/MPB",
  component: MPB
};

const Template = args => <MPB {...args} />;

export const MicroBridgeSuccess = Template.bind({});
MicroBridgeSuccess.args = {
  ethereumBalance: 5000654.454,
  celoBalance: 54654.546,
  fuseBalance: 54645.578,
  useCanBridge: (chain: string, amountWei: string) => ({
    isValid: true,
    reason: ""
  }),
  onBridge: async () => ({
    success: true,
    txHash: "0xbridge",
    relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
  }),
  relayStatus: { chainId: 42220, status: "Success", transaction: { hash: "0xrelay" } },
  bridgeStatus: { chainId: 122, status: "Success", transaction: { hash: "0xbridge" } }
};
export const MicroBridgeFail = Template.bind({});
MicroBridgeFail.args = {
  ethereumBalance: 5000654.454,
  celoBalance: 54654.546,
  fuseBalance: 54645.578,
  useCanBridge: (chain: string, amountWei: string) => ({
    isValid: false,
    reason: "Insuficent funds to cover bridging fee"
  }),
  onBridge: async () => ({
    success: false,
    txHash: "",
    relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
  }),
  relayStatus: undefined,
  bridgeStatus: undefined
};
