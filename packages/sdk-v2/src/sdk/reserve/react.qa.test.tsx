import React from "react";
import { act, render } from "@testing-library/react";
import { Contract } from "ethers";
import { useCall, useEthers } from "@usedapp/core";

import contractAddresses from "@gooddollar/goodprotocol/releases/deployment.json";
import { RESERVE_LIMIT_ERROR } from "./errors";
import { useSwap } from "./react";

jest.mock("@usedapp/core", () => ({
  ...jest.requireActual("@usedapp/core"),
  useCall: jest.fn(),
  useCalls: jest.fn(() => []),
  useEthers: jest.fn(),
  useTokenAllowance: jest.fn()
}));
jest.mock("../../contexts/Web3Context", () => ({
  useWeb3Context: () => ({ qa: { forceTradeLimits: mockForceTradeLimits } })
}));
jest.mock("../base/react", () => ({
  useG$Tokens: () => [{ address: mockGoodDollar }],
  useGetEnvChainId: (requiredChainId?: number) => {
    const env = requiredChainId === 50 || mockChainId === 50 ? "development-xdc" : "development-celo";
    return { connectedEnv: env, defaultEnv: env, chainId: requiredChainId ?? mockChainId };
  }
}));
jest.mock("../../hooks/useMulticallAtChain", () => ({ useReadOnlyProvider: () => undefined }));
jest.mock("../../hooks", () => ({ useRefreshOrNever: (refresh: number | string) => refresh }));
jest.mock("../base/hooks/useGasFees", () => ({ useGasFees: () => ({ gasPrice: undefined }) }));
jest.mock("ethers", () => ({
  ...jest.requireActual("ethers"),
  Contract: jest.fn()
}));

let mockForceTradeLimits = false;
let mockChainId = 42220;
let mockGoodDollar = "";
let mockSigner: jest.Mock;
let mockContracts: any[];
let latest: ReturnType<typeof useSwap>;
const originalNodeEnv = process.env.NODE_ENV;

const reserveToken = "0x0000000000000000000000000000000000000002";
const exchangeId = `0x${"1".repeat(64)}`;

const View = ({ exactInput, exactOutput }: { exactInput?: any; exactOutput?: any }) => {
  latest = useSwap(reserveToken, mockGoodDollar, exactInput, exactOutput);
  return null;
};

describe("Reserve force-trade-limits QA mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
    mockForceTradeLimits = false;
    mockChainId = 42220;
    mockGoodDollar = contractAddresses["development-celo"].GoodDollar;
    mockSigner = jest.fn(() => ({}));
    mockContracts = [];
    (useEthers as jest.Mock).mockImplementation(() => ({
      chainId: mockChainId,
      account: "0x0000000000000000000000000000000000000001",
      library: { getSigner: mockSigner }
    }));
    (useCall as jest.Mock).mockReturnValue({
      value: { pools: [{ assets: [mockGoodDollar, reserveToken], exchangeId }] }
    });
    (Contract as unknown as jest.Mock).mockImplementation((address: string) => {
      const methods = {
        approve: jest.fn(),
        swapIn: jest.fn(),
        swapOut: jest.fn()
      };
      const contract = {
        address,
        interface: {},
        connect: jest.fn(() => methods),
        ...methods
      };
      mockContracts.push(contract);
      return contract;
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const renderSwap = (exactInput?: any, exactOutput?: any) =>
    render(<View exactInput={exactInput} exactOutput={exactOutput} />);

  it("routes swapIn through the existing limit classifier without obtaining a signer", async () => {
    mockForceTradeLimits = true;
    const view = renderSwap({ input: "100", minAmountOut: "1" });

    await act(async () => {
      await latest.swap.send();
    });

    expect(latest.swap.state).toMatchObject({
      status: "Exception",
      chainId: 42220,
      errorType: RESERVE_LIMIT_ERROR
    });
    expect((latest.swap.state as any).originalError.message).toBe("L0Out Exceeded");
    expect(mockSigner).not.toHaveBeenCalled();
    expect(mockContracts.every(contract => contract.connect.mock.calls.length === 0)).toBe(true);
    view.unmount();
  });

  it("routes swapOut on XDC through the existing limit classifier without obtaining a signer", async () => {
    mockChainId = 50;
    mockGoodDollar = contractAddresses["development-xdc"].GoodDollar;
    (useCall as jest.Mock).mockReturnValue({
      value: { pools: [{ assets: [mockGoodDollar, reserveToken], exchangeId }] }
    });
    mockForceTradeLimits = true;
    const view = renderSwap(undefined, { output: "1", maxAmountIn: "100" });

    await act(async () => {
      await latest.swap.send();
    });

    expect(latest.swap.state).toMatchObject({
      status: "Exception",
      chainId: 50,
      errorType: RESERVE_LIMIT_ERROR
    });
    expect((latest.swap.state as any).originalError.message).toBe("L0Out Exceeded");
    expect(mockSigner).not.toHaveBeenCalled();
    expect(mockContracts.every(contract => contract.connect.mock.calls.length === 0)).toBe(true);
    view.unmount();
  });

  it("blocks direct approval calls without classifying them as a limit error", async () => {
    mockForceTradeLimits = true;
    const view = renderSwap({ input: "100", minAmountOut: "1" });

    await act(async () => {
      await latest.approve.send();
    });

    expect(latest.approve.state).toMatchObject({
      status: "Exception",
      chainId: 42220,
      errorMessage: "Reserve approvals are disabled in QA force-trade-limits mode"
    });
    expect((latest.approve.state as any).errorType).toBeUndefined();
    expect(mockSigner).not.toHaveBeenCalled();
    expect(mockContracts.every(contract => contract.connect.mock.calls.length === 0)).toBe(true);
    view.unmount();
  });

  it("leaves normal swap submission enabled when QA mode is off", async () => {
    const transaction = { wait: jest.fn().mockResolvedValue({ status: 1, logs: [] }) };
    const swapIn = jest.fn().mockResolvedValue(transaction);
    (Contract as unknown as jest.Mock).mockImplementation((address: string) => {
      const contract = {
        address,
        interface: {},
        connect: jest.fn(() => ({ approve: jest.fn(), swapIn, swapOut: jest.fn() })),
        approve: jest.fn(),
        swapIn: jest.fn(),
        swapOut: jest.fn()
      };
      mockContracts.push(contract);
      return contract;
    });
    const view = renderSwap({ input: "100", minAmountOut: "1" });

    await act(async () => {
      await latest.swap.send();
    });

    expect(mockSigner).toHaveBeenCalled();
    expect(swapIn).toHaveBeenCalled();
    view.unmount();
  });

  it("does not activate forced limits when a production build receives a QA context value", async () => {
    process.env.NODE_ENV = "production";
    mockForceTradeLimits = true;
    const transaction = { wait: jest.fn().mockResolvedValue({ status: 1, logs: [] }) };
    const swapIn = jest.fn().mockResolvedValue(transaction);
    (Contract as unknown as jest.Mock).mockImplementation((address: string) => ({
      address,
      interface: {},
      connect: jest.fn(() => ({ approve: jest.fn(), swapIn, swapOut: jest.fn() })),
      approve: jest.fn(),
      swapIn: jest.fn(),
      swapOut: jest.fn()
    }));
    const view = renderSwap({ input: "100", minAmountOut: "1" });

    await act(async () => {
      await latest.swap.send();
    });

    expect(mockSigner).toHaveBeenCalled();
    expect(swapIn).toHaveBeenCalled();
    view.unmount();
  });
});
