import * as React from "react";
import { VStack } from "native-base";
import { MPBBridge } from "../../../apps/bridge/mpbridge/MPBBridge";
import { W3Wrapper } from "../../W3Wrapper";
import { SwitchChainModal } from "../../../core/web3/modals/SwitchChainModal";

export default {
  title: "Apps/MPBBridge",
  component: MPBBridge,
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

export const MPBBridgeStory = {
  args: {
    useCanMPBBridge: (chain: string, amountWei: string) => {
      const amount = Number(amountWei);
      const minAmount = 1000000000000000000; // 1 G$
      const maxAmount = 1000000000000000000000000; // 1M G$

      if (amount < minAmount) {
        return { isValid: false, reason: "minAmount" };
      }
      if (amount > maxAmount) {
        return { isValid: false, reason: "maxAmount" };
      }
      return { isValid: true, reason: "" };
    },
    onSetChain: (chain: string) => console.log("Chain set to:", chain),
    originChain: ["fuse", (chain: string) => console.log("Origin chain:", chain)],
    inputTransaction: ["0", (amount: string) => console.log("Input amount:", amount)],
    pendingTransaction: [null, (transaction: any) => console.log("Pending transaction:", transaction)],
    limits: {
      fuse: {
        minAmount: "1000000000000000000", // 1 G$
        maxAmount: "1000000000000000000000000" // 1M G$
      },
      celo: {
        minAmount: "1000000000000000000", // 1 G$
        maxAmount: "1000000000000000000000000" // 1M G$
      },
      mainnet: {
        minAmount: "1000000000000000000", // 1 G$
        maxAmount: "1000000000000000000000000" // 1M G$
      }
    },
    fees: {
      fuse: {
        nativeFee: "100000000000000000", // 0.1 ETH
        zroFee: "0"
      },
      celo: {
        nativeFee: "50000000000000000", // 0.05 ETH
        zroFee: "0"
      },
      mainnet: {
        nativeFee: "200000000000000000", // 0.2 ETH
        zroFee: "0"
      }
    },
    bridgeStatus: undefined,
    onBridgeStart: () => console.log("Bridge started"),
    onBridgeFailed: (error: Error) => console.log("Bridge failed:", error),
    onBridgeSuccess: () => console.log("Bridge succeeded")
  }
};
