import { useEffect, useMemo, useState } from "react";
import { TransactionStatus } from "@usedapp/core";
import { ethers } from "ethers";
import { useAppState } from "../../../hooks";
import { BridgeRequest, MPBBridgeReadOnlyUrls } from "../types";
import { useMPBBridgeContracts } from "./useMPBBridgeContracts";

const COMPLETION_POLL_INTERVAL_MS = 15 * 1000;
const INITIAL_COMPLETION_LOOKBACK_BLOCKS = 3000;

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
  switchChainError: string | undefined,
  readOnlyUrls?: MPBBridgeReadOnlyUrls
) => {
  const { active } = useAppState();
  const bridgeRequestId = useMemo(() => {
    if (bridgeToState.status !== "Success" || !bridgeToState.receipt?.logs) {
      return undefined;
    }

    const id = extractBridgeRequestId(bridgeToState.receipt.logs, bridgeContract);

    return id;
  }, [bridgeToState.status, bridgeToState.receipt?.logs, bridgeContract, bridgeRequest]);

  const targetChainId = bridgeRequest?.targetChainId || 42220;
  const { bridgeContract: targetMpbContract } = useMPBBridgeContracts(targetChainId, readOnlyUrls);
  const [bridgeCompletedEvent, setBridgeCompletedEvent] = useState<ethers.Event>();

  useEffect(() => {
    let isMounted = true;
    let nextBlock: number | undefined;

    setBridgeCompletedEvent(undefined);

    if (!active || !bridgeRequestId || !targetMpbContract) {
      return;
    }

    const checkForCompletion = async () => {
      try {
        const latestBlock = await targetMpbContract.provider.getBlockNumber();
        const fromBlock = nextBlock ?? Math.max(0, latestBlock - INITIAL_COMPLETION_LOOKBACK_BLOCKS);

        if (fromBlock > latestBlock) {
          return;
        }

        // The request id is indexed. Filtering by it avoids downloading and
        // decoding every bridge completion in the lookback range.
        const filter = targetMpbContract.filters.ExecutedTransfer(null, null, null, null, null, null, bridgeRequestId);
        const events = await targetMpbContract.queryFilter(filter, fromBlock, latestBlock);
        nextBlock = latestBlock + 1;

        if (isMounted && events[0]) {
          setBridgeCompletedEvent(events[0]);
          clearInterval(interval);
        }
      } catch {
        // Target-chain RPC failures are transient. Keep the source transaction
        // status and retry the next small incremental range on the next poll.
      }
    };

    void checkForCompletion();
    const interval = setInterval(checkForCompletion, COMPLETION_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [active, bridgeRequestId, targetMpbContract]);

  useEffect(() => {
    if (!bridgeCompletedEvent) {
      return;
    }

    console.log("[useBridgeMonitoring] ExecutedTransfer event found on target chain", {
      bridgeRequestId,
      transactionHash: bridgeCompletedEvent.transactionHash,
      targetChainId: bridgeRequest?.targetChainId
    });
  }, [bridgeCompletedEvent, bridgeRequest?.targetChainId, bridgeRequestId]);

  const completionTransactionHash = useMemo(() => bridgeCompletedEvent?.transactionHash, [bridgeCompletedEvent]);

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
        completionTransactionHash || bridgeToState.receipt?.transactionHash || bridgeToState.transaction?.hash;

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
  }, [isSwitchingChain, switchChainError, approveState, bridgeToState, bridgeRequest, completionTransactionHash]);

  return { bridgeStatus, bridgeRequestId, bridgeCompletedEvent };
};
