import { Transaction, ReceiveTransaction, SendTransaction } from "../types";

export function isReceiveTransaction(transaction: Transaction): transaction is ReceiveTransaction {
  return ["bridge-in", "claim-start", "claim-confirmed", "receive"].includes(transaction.type);
}

export function isSendTransaction(transaction: Transaction): transaction is SendTransaction {
  return ["bridge-out", "send"].includes(transaction.type);
}
