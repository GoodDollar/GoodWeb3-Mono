import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Chain, DAppProvider } from "@usedapp/core";
import { providers, utils } from "ethers";
import TokenBridgeABI from "@gooddollar/bridge-contracts/artifacts/contracts/bridge/TokenBridge.sol/TokenBridge.json";
import { ConnectorContext } from "@usedapp/core/dist/cjs/src/providers/network/connectors/context";
import { useReadonlyNetworks } from "@usedapp/core/dist/cjs/src/providers/network/readonlyNetworks/context";
import { useGetContract, useG$Balance } from "./react";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";
import { useGetBridgeData, useWithinBridgeLimits } from "../microbridge/react";
import { CONTRACT_TO_ABI } from "./sdk";
import { getUrl } from "@ethersproject/web/lib/geturl";

jest.mock("@ethersproject/web/lib/geturl", () => ({ getUrl: jest.fn() }));

jest.mock("../../contexts", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Web3Context: React.createContext({ env: "production" }),
    TokenContext: React.createContext({ G$: { 122: 2, 42220: 18 }, GOOD: { 122: 18, 42220: 18 } })
  };
});
jest.mock("../claim/sdk", () => ({ ClaimSDK: class {} }));
jest.mock("../savings/sdk", () => ({ SavingsSDK: class {} }));
jest.mock("../../hooks", () => ({ useRefreshOrNever: (refresh: number) => refresh }));
jest.mock("../../hooks/useRefreshOrNever", () => ({ __esModule: true, default: (refresh: number) => refresh }));
jest.mock("@gooddollar/bridge-app/dist/sdk.js", () => ({ BridgeSDK: class {} }));
jest.mock("../storage", () => ({ AsyncStorage: {} }));
jest.mock("@usedapp/core/dist/esm/src/providers/network/readonlyNetworks", () =>
  jest.requireActual("@usedapp/core/dist/cjs/src/providers/network/readonlyNetworks")
);

const account = "0x0000000000000000000000000000000000000001";
const createMockChain = (chainId: number, chainName: string, multicallAddress: string): Chain => ({
  chainId,
  chainName,
  multicallAddress,
  isTestChain: true,
  isLocalChain: false,
  getExplorerAddressLink: address => `https://offline.invalid/address/${address}`,
  getExplorerTransactionLink: hash => `https://offline.invalid/tx/${hash}`
});
const aggregate = new utils.Interface([
  "function aggregate(tuple(address target,bytes callData)[] calls) view returns(uint256 blockNumber,bytes[] returnData)"
]);
const interfaces = [
  new utils.Interface(TokenBridgeABI.abi),
  ...Object.values(CONTRACT_TO_ABI).map(x => new utils.Interface(x.abi))
];
const valueFor = (param: utils.ParamType): any => {
  if (param.baseType === "tuple") return param.components.map(valueFor);
  if (param.type === "bool") return true;
  if (param.type === "string") return "";
  if (param.type === "address") return account;
  if (param.type === "uint8") return 18;
  return 100000;
};
const encodeCall = (data: string) => {
  for (const iface of interfaces) {
    let fn;
    try {
      fn = iface.getFunction(data.slice(0, 10));
    } catch {
      continue;
    }
    return iface.encodeFunctionResult(fn, fn.outputs.map(valueFor));
  }
  throw new Error("Unexpected call selector");
};

function createPool(chainId: number) {
  const children = ["a", "b"].map(name => {
    const child = new providers.StaticJsonRpcProvider(
      { url: `https://${name}.offline.invalid`, throttleLimit: 1, timeout: 5000 },
      chainId
    );
    jest.spyOn(child, "send");
    return child;
  });
  return new providers.FallbackProvider(
    children.map((provider, index) => ({ provider, priority: index + 1, weight: 1, stallTimeout: 1000 })),
    1
  );
}
let latest: any;
const View = () => {
  latest = {
    provider: useReadOnlyProvider(122),
    contextProviders: useReadonlyNetworks(),
    contract: useGetContract("GoodDollar", true, "base", 122),
    fuseFees: useGetBridgeData(122, ""),
    celoFees: useGetBridgeData(42220, ""),
    eligibility: useWithinBridgeLimits(122, account, "100"),
    fuseBalance: useG$Balance(5, 122),
    celoBalance: useG$Balance(5, 42220)
  };
  return null;
};

describe("SDK and Microbridge fallback read-provider wiring", () => {
  beforeEach(() => {
    (getUrl as jest.Mock).mockImplementation(async (url, options) => {
      if (url === "https://a.offline.invalid") return { statusCode: 429, headers: {}, body: Buffer.from("{}") };
      if (url !== "https://b.offline.invalid") throw new Error("Unexpected URL: network access forbidden");
      const request = JSON.parse(Buffer.from(options.body).toString());
      let result;
      if (request.method === "eth_blockNumber") result = "0x64";
      else if (request.method === "eth_getLogs") result = [];
      else if (request.method === "eth_call") {
        const { calls } = aggregate.decodeFunctionData("aggregate", request.params[0].data);
        result = aggregate.encodeFunctionResult("aggregate", [
          100,
          calls.map((call: { callData: string }) => encodeCall(call.callData))
        ]);
      } else throw new Error("Unexpected RPC method");
      return {
        statusCode: 200,
        headers: {},
        body: Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }))
      };
    });
  });
  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });
  afterAll(() => {
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  });
  it.each([false, true])(
    "loads form data through fallback provider (factory=%s)",
    async factory => {
      const fuse = createPool(122),
        celo = createPool(42220);
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      await act(async () =>
        root.render(
          <DAppProvider
            config={{
              readOnlyChainId: 122,
              readOnlyUrls: { 122: factory ? () => fuse : fuse, 42220: factory ? () => celo : celo },
              networks: [
                createMockChain(122, "Mock Fuse", "0x0000000000000000000000000000000000000010"),
                createMockChain(42220, "Mock Celo", "0x0000000000000000000000000000000000000020")
              ],
              multicallVersion: 1,
              pollingInterval: 15000,
              autoConnect: false
            }}
          >
            <ConnectorContext.Provider value={{ account, chainId: 122 } as any}>
              <View />
            </ConnectorContext.Provider>
          </DAppProvider>
        )
      );
      try {
        // Finish each act scope so React 18 can commit usedapp's debounced multicall effects.
        for (let i = 0; i < 240 && (!latest.fuseFees.bridgeFees || !latest.celoFees.bridgeFees); i++) {
          await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
          });
        }
        expect(latest.fuseFees.bridgeFees).toBeDefined();
        expect(latest.celoFees.bridgeFees).toBeDefined();
        expect(latest.eligibility.isValid).toBe(true);
        expect(latest.fuseBalance.G$.value.toString()).toBe("100000");
        expect(latest.celoBalance.G$.value.toString()).toBe("100000");
        expect(latest.provider).toBe(fuse);
        expect(latest.contextProviders[122]).toBe(fuse);
        expect(latest.contract.provider).toBe(fuse);
        for (const pool of [fuse, celo]) {
          const a = pool.providerConfigs[0].provider as providers.StaticJsonRpcProvider;
          const b = pool.providerConfigs[1].provider as providers.StaticJsonRpcProvider;
          expect(a.send).toHaveBeenCalled();
          expect(b.send).toHaveBeenCalledWith("eth_call", expect.any(Array));
          expect(
            (b.send as jest.Mock).mock.calls.every(([method]) => !method.includes("send") && !method.includes("sign"))
          ).toBe(true);
        }
      } finally {
        await act(async () => root.unmount());
        container.remove();
        for (const pool of [fuse, celo]) {
          pool.removeAllListeners();
          pool.polling = false;
          for (const { provider } of pool.providerConfigs) {
            (provider as providers.BaseProvider).removeAllListeners();
            (provider as providers.BaseProvider).polling = false;
          }
        }
      }
    },
    30000
  );
});
