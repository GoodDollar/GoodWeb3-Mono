import { getTransactionErrorMessage, isTransientBlockReadError } from "./useMPBBridge.helpers";

describe("useMPBBridge transaction error helpers", () => {
  it("detects unknown block read errors from common wallet/provider shapes", () => {
    expect(isTransientBlockReadError(new Error("Unknown block"))).toBe(true);
    expect(isTransientBlockReadError({ reason: "no block found" })).toBe(true);
    expect(isTransientBlockReadError({ error: { data: { message: "UNKNOWN BLOCK" } } })).toBe(true);
  });

  it("does not classify regular transaction failures as transient block reads", () => {
    expect(isTransientBlockReadError(new Error("user rejected transaction"))).toBe(false);
    expect(isTransientBlockReadError({ error: { message: "execution reverted" } })).toBe(false);
  });

  it("extracts a readable transaction error message", () => {
    expect(getTransactionErrorMessage({ error: { data: { message: "execution reverted" } } })).toBe(
      "execution reverted"
    );
    expect(getTransactionErrorMessage({ reason: "user rejected transaction" })).toBe("user rejected transaction");
  });
});
