import { useCallback } from "react";
import { ethers } from "ethers";
import { BridgeRequest } from "../types";
import { BridgeProvider, getChainName, calculateBridgeFees, isSupportedChain } from "../constants";
import { SupportedChains } from "../../constants";

export const useBridgeValidators = (
  account: string | undefined | null,
  gdContract: any,
  bridgeContract: ethers.Contract | null,
  bridgeProvider: BridgeProvider,
  tokenDecimals: number | undefined,
  library: any
) => {
  // Comprehensive pre-flight validation function
  const validateBridgeTransaction = useCallback(
    async (bridgeRequest: BridgeRequest, fees: any) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!gdContract) {
        throw new Error("Token contract not available");
      }

      if (!bridgeContract) {
        throw new Error("Bridge contract not available");
      }

      const amountBN = ethers.BigNumber.from(bridgeRequest.amount);
      const calculatedFees = calculateBridgeFees(
        fees,
        bridgeProvider,
        getChainName(bridgeRequest.sourceChainId),
        getChainName(bridgeRequest.targetChainId)
      );
      const nativeFee = calculatedFees.nativeFee || ethers.BigNumber.from(0);
      try {
        const balance = await gdContract.balanceOf(account);

        if (balance.lt(amountBN)) {
          const balanceFormatted = ethers.utils.formatUnits(balance, tokenDecimals || 18);
          const amountFormatted = ethers.utils.formatUnits(amountBN, tokenDecimals || 18);
          throw new Error(`Insufficient balance. You have ${balanceFormatted} G$ but need ${amountFormatted} G$`);
        }
      } catch (error: any) {
        if (error.message.includes("Insufficient balance")) {
          throw error;
        }
      }

      try {
        const allowance = await gdContract.allowance(account, bridgeContract.address);

        if (allowance.lt(amountBN)) {
          // Approval will be requested automatically
        }
      } catch (error: any) {
        // Could not check token allowance, proceed with validation
      }

      // ✅ Check 3: Destination chain is supported
      if (!isSupportedChain(bridgeRequest.sourceChainId)) {
        throw new Error(
          `Unsupported source chain: ${bridgeRequest.sourceChainId}. Supported chains: ${Object.values(
            SupportedChains
          ).join(", ")}`
        );
      }

      if (!isSupportedChain(bridgeRequest.targetChainId)) {
        throw new Error(
          `Unsupported target chain: ${bridgeRequest.targetChainId}. Supported chains: ${Object.values(
            SupportedChains
          ).join(", ")}`
        );
      }

      // Check with contract if method exists
      try {
        if (typeof bridgeContract.isSupportedChain === "function") {
          const isSupported = await bridgeContract.isSupportedChain(bridgeRequest.targetChainId);
          if (!isSupported) {
            throw new Error(`Chain ${bridgeRequest.targetChainId} is not supported for bridging`);
          }
        }
      } catch (checkError: any) {
        if (checkError.message.includes("not supported")) {
          throw checkError;
        }
      }

      // ✅ Check 4: Bridge is not paused
      try {
        if (typeof bridgeContract.paused === "function") {
          const isPaused = await bridgeContract.paused();
          if (isPaused) {
            throw new Error("Bridge is currently paused. Please try again later.");
          }
        }
      } catch (checkError: any) {
        if (checkError.message.includes("paused")) {
          throw checkError;
        }
      }

      // ✅ Check 5: User has enough native token for gas
      try {
        if (library && account) {
          const nativeBalance = await library.getBalance(account);
          // Minimum 0.01 native token (CELO, ETH, etc.)
          const minGasBalance = ethers.utils.parseEther("0.01");
          // Add buffer for the bridge fee
          const requiredBalance = minGasBalance.add(nativeFee);

          if (nativeBalance.lt(requiredBalance)) {
            const balanceFormatted = ethers.utils.formatEther(nativeBalance);
            const requiredFormatted = ethers.utils.formatEther(requiredBalance);
            const chainName = getChainName(bridgeRequest.sourceChainId);
            throw new Error(
              `Insufficient ${
                chainName === "celo" ? "CELO" : chainName === "fuse" ? "FUSE" : "ETH"
              } for gas. You have ${balanceFormatted} but need at least ${requiredFormatted} (including bridge fee)`
            );
          }
        }
      } catch (error: any) {
        if (error.message.includes("Insufficient")) {
          throw error;
        }
      }

      // ✅ Check 6: Amount meets minimum requirements
      try {
        const limits = await bridgeContract.bridgeLimits();
        const minAmount = limits.minAmount;

        if (amountBN.lt(minAmount)) {
          const minFormatted = ethers.utils.formatUnits(minAmount, tokenDecimals || 18);
          throw new Error(`Amount too small. Minimum: ${minFormatted} G$`);
        }
      } catch (error: any) {
        if (error.message.includes("Amount too small") || error.message.includes("Minimum")) {
          throw error;
        }
      }

      // ✅ Check 7: User hasn't exceeded bridge limits
      try {
        const limits = await bridgeContract.bridgeLimits();
        const txLimit = limits.txLimit;

        if (amountBN.gt(txLimit)) {
          const limitFormatted = ethers.utils.formatUnits(txLimit, tokenDecimals || 18);
          throw new Error(`Amount exceeds transaction limit. Maximum: ${limitFormatted} G$`);
        }

        // Check daily limits if available
        if (typeof bridgeContract.canBridge === "function") {
          const canBridge = await bridgeContract.canBridge(account, amountBN);
          if (!canBridge) {
            throw new Error("Bridge limit exceeded. Please check your daily limits or try a smaller amount.");
          }
        }
      } catch (error: any) {
        if (error.message.includes("limit") || error.message.includes("exceeded")) {
          throw error;
        }
      }

      return true;
    },
    [account, gdContract, bridgeContract, bridgeProvider, tokenDecimals, library]
  );

  return { validateBridgeTransaction };
};
