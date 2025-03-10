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
  balance: 987968509,
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
  balance: 50006544,
 
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
export const MicroBridgeWaiting = Template.bind({});
MicroBridgeWaiting.args = {  
  balance: 54645578,
  useCanBridge: (chain: string, amountWei: string) => ({
    isValid: true,
    reason: ""
  }),
  onBridge: async () => ({
    success: false,
    txHash: "",
    relayPromise: Promise.resolve({ txHash: "0xrelay", success: true })
  }),
  relayStatus: undefined,
  bridgeStatus: undefined
};
