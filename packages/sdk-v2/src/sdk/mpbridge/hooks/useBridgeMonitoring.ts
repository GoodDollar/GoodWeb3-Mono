import { useMemo } from "react";
import { useLogs, TransactionStatus } from "@usedapp/core";
import { ethers } from "ethers";
import { useRefreshOrNever } from "../../../hooks";
import { BridgeRequest } from "../types";
import { useGetMPBContract } from "./useGetMPBContract";

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
  const bridgeRequestId = useMemo(() => {
    if (bridgeToState.status !== "Success" || !bridgeToState.receipt?.logs) {
      return undefined;
    }

    const id = extractBridgeRequestId(bridgeToState.receipt.logs, bridgeContract);

    return id;
  }, [bridgeToState.status, bridgeToState.receipt?.logs, bridgeContract, bridgeRequest]);

  const targetBridgeContract = useGetMPBContract(bridgeRequest?.targetChainId);

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
      fromBlock: -3000
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

    if (bridgeToState.status === "Success") {
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
