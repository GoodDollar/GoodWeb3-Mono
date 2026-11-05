import React from "react";
import { act, render } from "@testing-library/react";
import { Contract, providers } from "ethers";
import TokenBridgeABI from "@gooddollar/bridge-contracts/artifacts/contracts/bridge/TokenBridge.sol/TokenBridge.json";
import { AsyncStorage } from "../storage";
import { useMicroBridgeHistory } from "./useMicroBridgeHistory";

let mockAccount = "0x0000000000000000000000000000000000000001";
let mockBlock = 0;
const mockProvider = new providers.StaticJsonRpcProvider("https://offline.invalid", 122);
const address = "0x0000000000000000000000000000000000000003";

jest.mock("@usedapp/core", () => ({
  useEthers: () => ({ account: mockAccount }),
  useBlockNumbers: () => ({ 122: mockBlock })
}));
jest.mock("@usedapp/core/dist/esm/src/providers/network/readonlyNetworks", () => ({
  useReadonlyNetworks: () => ({ 122: mockProvider })
}));
jest.mock("../../hooks/useRefreshOrNever", () => ({ __esModule: true, default: () => 5 }));
jest.mock("../storage", () => ({ AsyncStorage: { getItem: jest.fn(), setItem: jest.fn() } }));

let latest: ReturnType<typeof useMicroBridgeHistory>;
const View = () => {
  // The existing bridge factory creates a fresh contract on every render.
  latest = useMicroBridgeHistory(122, new Contract(address, TokenBridgeABI.abi));
  return null;
};
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) {
      await Promise.resolve();
      jest.runOnlyPendingTimers();
    }
  });
};

describe("Microbridge history hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockAccount = "0x0000000000000000000000000000000000000001";
    mockBlock = 0;
    jest.spyOn(mockProvider, "getBlockNumber").mockResolvedValue(0);
    jest.spyOn(mockProvider, "getLogs").mockResolvedValue([]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("uses one queue per chain, keeps the contract stable, and refreshes only after five blocks", async () => {
    const view = render(<View />);
    await flush();
    expect(mockProvider.getLogs).toHaveBeenCalledTimes(4);
    expect(latest).toEqual({ requests: { value: [] }, transfers: { value: [] } });
    view.rerender(<View />);
    await flush();
    expect(mockProvider.getBlockNumber).toHaveBeenCalledTimes(1);
    expect(mockProvider.getLogs).toHaveBeenCalledTimes(4);
    mockBlock = 4;
    view.rerender(<View />);
    await flush();
    expect(mockProvider.getLogs).toHaveBeenCalledTimes(4);
    mockBlock = 5;
    view.rerender(<View />);
    await flush();
    expect(mockProvider.getLogs).toHaveBeenCalledTimes(8);
    expect(
      (mockProvider.getLogs as jest.Mock).mock.calls.slice(4).map(call => [call[0].fromBlock, call[0].toBlock])
    ).toEqual(Array(4).fill([1, 5]));
    view.unmount();
  });

  it("hides the previous account's history immediately and ignores its in-flight response", async () => {
    let resolveOld: (logs: providers.Log[]) => void = () => undefined;
    (mockProvider.getLogs as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveOld = resolve;
        })
    );
    const view = render(<View />);
    await flush();
    expect(mockProvider.getLogs).toHaveBeenCalledTimes(1);
    mockAccount = "0x0000000000000000000000000000000000000002";
    view.rerender(<View />);
    expect(latest).toEqual({});
    await flush();
    const writesBefore = (AsyncStorage.setItem as jest.Mock).mock.calls.length;
    await act(async () => {
      resolveOld([]);
    });
    await flush();
    expect((AsyncStorage.setItem as jest.Mock).mock.calls.length).toBe(writesBefore);
    expect((AsyncStorage.setItem as jest.Mock).mock.calls.every(call => call[0].endsWith(mockAccount))).toBe(true);
    view.unmount();
  });
});
