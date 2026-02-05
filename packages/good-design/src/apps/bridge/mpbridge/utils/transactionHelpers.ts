import { ethers, utils } from "ethers";
import { getSourceChainId } from "@gooddollar/web3sdk-v2";
import { BridgeTransaction } from "../MPBBridgeTransactionCard";
import { TransactionStatus } from "@usedapp/core";

interface CreateTransactionDetailsParams {
  amountWei: string;
  sourceChain: string;
  targetChain: string;
  bridgeProvider: string;
  bridgeStatus: Partial<TransactionStatus> | undefined;
  bridgeToTxHash: string | undefined;
}

export const createTransactionDetails = (params: CreateTransactionDetailsParams): BridgeTransaction => {
  const { amountWei, sourceChain, targetChain, bridgeProvider, bridgeStatus, bridgeToTxHash } = params;

  const amountBN = ethers.BigNumber.from(amountWei || "0");
  const amountFormatted = utils.formatEther(amountBN);

  let status: "completed" | "pending" | "failed" | "bridging" = "pending";
  if (bridgeStatus?.status === "Fail" || bridgeStatus?.status === "Exception") {
    status = "failed";
  } else if (bridgeStatus?.status === "Mining") {
    status = "bridging";
  }

  const sourceChainId = getSourceChainId(sourceChain);
  const transactionHash = bridgeStatus?.transaction?.hash || bridgeToTxHash || "";

  return {
    id: transactionHash,
    transactionHash,
    sourceChain: sourceChain.charAt(0).toUpperCase() + sourceChain.slice(1),
    targetChain: targetChain.charAt(0).toUpperCase() + targetChain.slice(1),
    amount: parseFloat(amountFormatted).toFixed(2),
    bridgeProvider: bridgeProvider as "axelar" | "layerzero",
    status,
    chainId: sourceChainId
  };
};
