import { useMemo } from "react";
import { useLogs, TransactionStatus } from "@usedapp/core";
import { ethers } from "ethers";
import { useRefreshOrNever } from "../../../hooks";
import { BridgeRequest } from "../types";
import { useGetMPBContract } from "./useGetMPBContract";

// Helper function to extract bridge request ID from logs
export const extractBridgeRequestId = (logs: any[], bridgeContract: any): string | undefined => {
  const bridgeTopic = ethers.utils.id("BridgeRequest(address,address,uint256,uint256,uint256,uint8,uint256)");

  for (const log of logs) {
    if (log.address === bridgeContract?.address && log.topics[0] === bridgeTopic) {
      try {
        const parsedLog = bridgeContract.interface.parseLog(log);
        if (parsedLog.args.id) {
          return parsedLog.args.id.toString();
        }
      } catch (e) {
        // Failed to parse bridge log, skip it
      }
    }
  }
  return undefined;
};

export const useBridgeMonitoring = (
  bridgeRequest: BridgeRequest | undefined,
  bridgeContract: ethers.Contract | null,
  approveState: TransactionStatus,
  bridgeToState: TransactionStatus,
  isSwitchingChain: boolean,
  switchChainError: string | undefined
) => {
  // Extract bridge request ID from bridgeTo logs
  const bridgeRequestId = useMemo(() => {
    if (bridgeToState.status !== "Success" || !bridgeToState.receipt?.logs) {
      return undefined;
    }

    const id = extractBridgeRequestId(bridgeToState.receipt.logs, bridgeContract);
    console.log("[useBridgeMonitoring] bridgeTo succeeded on source chain, extracted bridgeRequestId", {
      bridgeRequestId: id,
      transactionHash: bridgeToState.receipt.transactionHash,
      chainId: bridgeRequest?.sourceChainId
    });
    return id;
  }, [bridgeToState.status, bridgeToState.receipt?.logs, bridgeContract, bridgeRequest]);

  // Get target chain bridge contract for polling completion
  const targetBridgeContract = useGetMPBContract(bridgeRequest?.targetChainId);

  // Poll target chain for bridge completion
  const bridgeCompletedLogs = useLogs(
    bridgeRequest &&
      bridgeRequestId &&
      targetBridgeContract && {
        contract: targetBridgeContract,
        event: "ExecutedTransfer",
        args: []
      },
    {
      refresh: useRefreshOrNever(bridgeRequestId ? 5 : "never"),
      chainId: bridgeRequest?.targetChainId,
      fromBlock: -5000
    }
  );

  const bridgeCompletedEvent = useMemo(() => {
    if (!bridgeCompletedLogs?.value || !bridgeRequestId) return undefined;
    const event = bridgeCompletedLogs.value.find(log => {
      const id = log.data?.id || log.data?.[6];
      return id?.toString() === bridgeRequestId.toString();
    });
    if (event) {
      console.log("[useBridgeMonitoring] ExecutedTransfer event found on target chain", {
        bridgeRequestId,
        transactionHash: event.transactionHash,
        targetChainId: bridgeRequest?.targetChainId
      });
    }
    return event;
  }, [bridgeCompletedLogs, bridgeRequestId, bridgeRequest]);

  const bridgeStatus: Partial<TransactionStatus> | undefined = useMemo(() => {
    if (isSwitchingChain) {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "PendingSignature",
        errorMessage: switchChainError
      } as TransactionStatus;
    }

    if (approveState.status === "Mining" || approveState.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: approveState.status,
        transaction: approveState.transaction
      } as TransactionStatus;
    }

    if (bridgeToState.status === "Mining" || bridgeToState.status === "PendingSignature") {
      console.log("[useBridgeMonitoring] bridgeTo is mining/pending", {
        status: bridgeToState.status,
        transactionHash: bridgeToState.transaction?.hash
      });
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: bridgeToState.status,
        transaction: bridgeToState.transaction
      } as TransactionStatus;
    }

    // Show success when bridgeTo succeeds on source chain (don't wait for target chain completion)
    if (bridgeToState.status === "Success") {
      console.log("[useBridgeMonitoring] bridgeTo succeeded on source chain - returning Success status", {
        transactionHash: bridgeToState.transaction?.hash,
        receiptHash: bridgeToState.receipt?.transactionHash,
        sourceChainId: bridgeRequest?.sourceChainId,
        targetChainId: bridgeRequest?.targetChainId,
        hasBridgeCompletedEvent: !!bridgeCompletedEvent
      });

      // If we have the completed event on target chain, use that transaction hash
      // Otherwise, use the source chain bridgeTo transaction hash
      const transactionHash =
        bridgeCompletedEvent?.transactionHash ||
        bridgeToState.receipt?.transactionHash ||
        bridgeToState.transaction?.hash;

      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Success",
        transaction: { hash: transactionHash }
      } as TransactionStatus;
    }

    if (approveState.status === "Exception") {
      console.log("[useBridgeMonitoring] approve failed", {
        errorMessage: approveState.errorMessage
      });
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: approveState.errorMessage
      } as TransactionStatus;
    }

    if (bridgeToState.status === "Exception") {
      console.log("[useBridgeMonitoring] bridgeTo failed", {
        errorMessage: bridgeToState.errorMessage
      });
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: bridgeToState.errorMessage
      } as TransactionStatus;
    }

    // If we have a switchChainError, show it
    if (switchChainError) {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: switchChainError
      } as TransactionStatus;
    }

    return undefined;
  }, [isSwitchingChain, switchChainError, approveState, bridgeToState, bridgeRequest, bridgeCompletedEvent]);

  return { bridgeStatus, bridgeRequestId, bridgeCompletedEvent };
};
