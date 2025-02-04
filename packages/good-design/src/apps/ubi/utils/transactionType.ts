import { Transaction, ReceiveTransaction, SendTransaction } from "../types";

export const isReceiveTransaction = (transaction: Transaction): transaction is ReceiveTransaction =>
  ["bridge-in", "claim-confirmed", "receive"].includes(transaction.type);

export const isSendTransaction = (transaction: Transaction): transaction is SendTransaction =>
  ["bridge-out", "send"].includes(transaction.type);

export const isTxReject = (errorMessage: string) => errorMessage === "user rejected transaction";
