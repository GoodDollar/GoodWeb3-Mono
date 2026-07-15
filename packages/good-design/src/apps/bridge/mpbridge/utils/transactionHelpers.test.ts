import { TransactionStatus } from "@usedapp/core";

import { createTransactionDetails } from "./transactionHelpers";

jest.mock("@gooddollar/web3sdk-v2", () => ({
  getSourceChainId: jest.fn(() => 42220)
}));

describe("createTransactionDetails", () => {
  it("sets a date for the submitted transaction details", () => {
    const date = new Date("2026-07-07T10:00:00.000Z");

    const transaction = createTransactionDetails({
      amountWei: "10000000000000000000",
      sourceChain: "celo",
      targetChain: "xdc",
      bridgeProvider: "layerzero",
      bridgeStatus: {
        status: "Success",
        transaction: { hash: "0xbridge" }
      } as Partial<TransactionStatus>,
      bridgeToTxHash: undefined,
      date
    });

    expect(transaction.date).toBe(date);
    expect(transaction.transactionHash).toBe("0xbridge");
    expect(transaction.amount).toBe("10.00");
  });
});
