import { utils } from "ethers";
import type { TransactionStatus } from "@usedapp/core";

export const RESERVE_LIMIT_ERROR = "RESERVE_LIMIT" as const;

export type ReserveLimitReason =
  | "L0Out Exceeded"
  | "L1Out Exceeded"
  | "L0In Exceeded"
  | "L1In Exceeded"
  | "LG Exceeded";

export interface ReserveTransactionStatus extends TransactionStatus {
  errorType?: typeof RESERVE_LIMIT_ERROR;
  /** The unmodified provider/ethers error, for debugging rather than display. */
  originalError?: unknown;
}

const limitReasons = new Set<string>([
  "L0Out Exceeded",
  "L1Out Exceeded",
  "L0In Exceeded",
  "L1In Exceeded",
  "LG Exceeded"
]);

const exactLimitReason = (reason: string): ReserveLimitReason | undefined =>
  limitReasons.has(reason) ? (reason as ReserveLimitReason) : undefined;

const decodeRevertReason = (data: string): ReserveLimitReason | undefined => {
  // Solidity Error(string), not Panic(uint256) or arbitrary custom errors.
  if (!/^0x08c379a0[0-9a-f]+$/i.test(data)) return undefined;
  try {
    const [reason] = utils.defaultAbiCoder.decode(["string"], `0x${data.slice(10)}`) as [string];
    return exactLimitReason(reason);
  } catch {
    return undefined;
  }
};

const reasonFromMessage = (message: string): ReserveLimitReason | undefined => {
  const exact = exactLimitReason(message.trim());
  if (exact) return exact;

  // Recognize complete revert reasons in standard ethers/RPC wrappers, not loose substrings.
  const reverted = message.match(
    /(?:execution reverted(?::| with reason string)|VM Exception while processing transaction: revert)\s*["']?(L[01](?:Out|In) Exceeded|LG Exceeded)["']?(?=$|\s*\()/i
  );
  const attributed = message.match(/\b(?:reason|message)["']?\s*[:=]\s*["'](L[01](?:Out|In) Exceeded|LG Exceeded)["']/);
  const reason = exactLimitReason(reverted?.[1] ?? attributed?.[1] ?? "");
  if (reason) return reason;

  // Some providers put the ABI-encoded revert data only in the serialized message.
  for (const match of message.matchAll(/\b(?:data|return|result|revertData)["']?\s*[:=]\s*["']?(0x[0-9a-f]+)/gi)) {
    const decoded = decodeRevertReason(match[1]);
    if (decoded) return decoded;
  }
  return undefined;
};

/** Detect only the five known Reserve trading-limit reasons in nested ethers/RPC errors. */
export const getReserveLimitReason = (error: unknown): ReserveLimitReason | undefined => {
  const pending: unknown[] = [error];
  const seen = new Set<object>();
  let found: ReserveLimitReason | undefined;

  while (pending.length) {
    const value = pending.pop();
    if (typeof value === "string") {
      found ??= reasonFromMessage(value) ?? decodeRevertReason(value);
      try {
        // JSON-RPC response bodies can contain a second, serialized error object.
        const trimmed = value.trimStart();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) pending.push(JSON.parse(value));
      } catch {
        // Plain messages and malformed JSON are handled as text above.
      }
    } else if (value && typeof value === "object" && !seen.has(value)) {
      seen.add(value);
      const record = value as Record<string, unknown>;
      // Preserve wallet-rejection handling even if a provider attaches an earlier simulation error.
      if (record.code === 4001 || record.code === "4001" || record.code === "ACTION_REJECTED") return undefined;
      for (const key of ["reason", "message", "shortMessage", "error", "originalError", "cause", "body", "response"]) {
        pending.push(record[key]);
      }
      for (const key of ["data", "return", "result", "revertData"]) {
        const data = record[key];
        pending.push(data);
        // MetaMask sometimes keys the revert details by transaction hash under `data`.
        if (data && typeof data === "object") pending.push(...Object.values(data));
      }
    }
  }
  return found;
};
