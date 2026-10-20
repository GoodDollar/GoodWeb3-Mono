import React from "react";
import { act, render } from "@testing-library/react";
import { Contract, ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { useContractFunctionWithDefaultGasFees, useGasFees } from "../base/hooks/useGasFees";
import { isEip7702DelegationCode, useMicroBridgeTransfer } from "./useMicroBridgeTransfer";

jest.mock("@usedapp/core", () => ({ useEthers: jest.fn() }));
jest.mock("../base/hooks/useGasFees", () => ({
  useContractFunctionWithDefaultGasFees: jest.fn(),
  useGasFees: jest.fn()
}));

const account = "0x0000000000000000000000000000000000000001";
const eip7702Code = `0xef0100${"2".repeat(40)}`;
const ordinaryTransaction = { hash: "0xtransaction", wait: jest.fn() };
let latest: ReturnType<typeof useMicroBridgeTransfer>;
let mockContract: Contract;
let mockLibrary: any;
let mockUsedapp: any;

const View = () => {
  latest = useMicroBridgeTransfer(mockContract);
  return null;
};

describe("MicroBridge transfer submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLibrary = {
      getCode: jest.fn(),
      getSigner: jest.fn(() => ({}))
    };
    mockContract = {
      address: "0x0000000000000000000000000000000000000002",
      interface: { getFunction: () => ({ inputs: [{}, {}, {}] }) },
      connect: jest.fn(() => ({ transferAndCall: jest.fn().mockResolvedValue(ordinaryTransaction) }))
    } as any;
    mockUsedapp = {
      state: { status: "None" },
      send: jest.fn().mockResolvedValue(ordinaryTransaction),
      resetState: jest.fn()
    };
    (useEthers as jest.Mock).mockReturnValue({ account, chainId: 122, library: mockLibrary });
    (useContractFunctionWithDefaultGasFees as jest.Mock).mockReturnValue(mockUsedapp);
    (useGasFees as jest.Mock).mockReturnValue({
      gasPrice: ethers.BigNumber.from(10),
      maxPriorityFeePerGas: ethers.BigNumber.from(1)
    });
  });

  it("keeps ordinary EOAs on usedapp's wallet transaction path", async () => {
    mockLibrary.getCode.mockResolvedValue("0x");
    render(<View />);

    await act(async () => {
      await latest.send("to", "amount", "data");
    });

    expect(mockUsedapp.send).toHaveBeenCalledWith("to", "amount", "data");
    expect(mockContract.connect).not.toHaveBeenCalled();
  });

  it("uses the wallet signer for an EIP-7702 delegation marker and tracks its receipt", async () => {
    mockLibrary.getCode.mockResolvedValue(eip7702Code);
    const receipt: { status: number; logs: any[] } = { status: 1, logs: [] };
    let resolveReceipt: (value: typeof receipt) => void = () => undefined;
    ordinaryTransaction.wait.mockReturnValue(
      new Promise<typeof receipt>(resolve => {
        resolveReceipt = resolve;
      })
    );
    render(<View />);

    let resolveSubmission: (transaction: typeof ordinaryTransaction) => void = () => undefined;
    (mockContract.connect as jest.Mock).mockReturnValue({
      transferAndCall: jest.fn(
        () =>
          new Promise<typeof ordinaryTransaction>(resolve => {
            resolveSubmission = resolve;
          })
      )
    });
    let submission: Promise<any> | undefined;
    await act(async () => {
      submission = latest.send("to", "amount", "data");
      await Promise.resolve();
    });
    expect(latest.state.status).toBe("PendingSignature");
    await act(async () => resolveSubmission(ordinaryTransaction));
    expect(submission).toBeDefined();
    await submission;
    expect(latest.state.status).toBe("Mining");
    expect(mockContract.connect).toHaveBeenCalled();
    expect(mockUsedapp.send).not.toHaveBeenCalled();

    await act(async () => {
      resolveReceipt(receipt);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(latest.state.status).toBe("Success");
    expect(latest.state.receipt).toBe(receipt);
  });

  it("routes non-delegation contract code through usedapp's Safe-aware fallback", async () => {
    mockLibrary.getCode.mockResolvedValue("0x6001600055");
    render(<View />);

    await act(async () => {
      await latest.send("to", "amount", "data");
    });

    expect(mockUsedapp.send).toHaveBeenCalledWith("to", "amount", "data");
    expect(mockContract.connect).not.toHaveBeenCalled();
  });

  it("reports delegated-wallet rejections and reverted receipts without resubmitting", async () => {
    mockLibrary.getCode.mockResolvedValue(eip7702Code);
    render(<View />);
    const rejection = Object.assign(new Error("User rejected"), { code: 4001 });

    const rejectedSend = jest.fn().mockRejectedValue(rejection);
    (mockContract.connect as jest.Mock).mockReturnValue({ transferAndCall: rejectedSend });
    await act(async () => {
      await latest.send("to", "amount", "data");
    });
    expect(latest.state.status).toBe("Exception");
    expect(rejectedSend).toHaveBeenCalledTimes(1);

    const revertedReceipt = { status: 0, logs: [] };
    ordinaryTransaction.wait.mockRejectedValue(
      Object.assign(new Error("execution reverted"), { receipt: revertedReceipt })
    );
    (mockContract.connect as jest.Mock).mockReturnValue({
      transferAndCall: jest.fn().mockResolvedValue(ordinaryTransaction)
    });
    await act(async () => {
      await latest.send("to", "amount", "data");
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(latest.state.status).toBe("Fail");
    expect(latest.state.receipt).toBe(revertedReceipt);
  });

  it("keeps mining state and the transaction hash when receipt tracking fails without a receipt", async () => {
    mockLibrary.getCode.mockResolvedValue(eip7702Code);
    ordinaryTransaction.wait.mockRejectedValue(new Error("RPC unavailable"));
    render(<View />);

    const submit = jest.fn().mockResolvedValue(ordinaryTransaction);
    (mockContract.connect as jest.Mock).mockReturnValue({ transferAndCall: submit });
    await act(async () => {
      await latest.send("to", "amount", "data");
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latest.state.status).toBe("Mining");
    expect(latest.state.transaction).toBe(ordinaryTransaction);
    expect(latest.state.transaction?.hash).toBe(ordinaryTransaction.hash);
    expect(latest.state.errorMessage).toMatch(/Unable to confirm transaction/);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("recognizes only the 23-byte EIP-7702 delegation designator", () => {
    expect(isEip7702DelegationCode(eip7702Code)).toBe(true);
    expect(isEip7702DelegationCode("0x6001600055")).toBe(false);
    expect(isEip7702DelegationCode("0xef0100")).toBe(false);
  });
});
