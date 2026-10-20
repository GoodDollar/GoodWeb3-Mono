import { providers } from "ethers";
import { BaseSDK } from "./sdk";

const account = "0x0000000000000000000000000000000000000001";
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

describe("BaseSDK provider compatibility", () => {
  it("initializes fallback read contracts without getSigner or HTTP calls", async () => {
    const child = new providers.StaticJsonRpcProvider("https://offline.invalid", 122);
    const send = jest.spyOn(child, "send").mockRejectedValue(new Error("No network access allowed"));
    const provider = new providers.FallbackProvider([child], 1);
    const sdk = new BaseSDK(provider as unknown as providers.JsonRpcProvider, "production");
    await flush();
    expect(sdk.signer).toBeUndefined();
    expect(sdk.getContract("GoodDollar").provider).toBe(provider);
    expect(send).not.toHaveBeenCalled();
  });

  it("keeps the wallet signer path for providers exposing getSigner", async () => {
    const provider = new providers.StaticJsonRpcProvider("https://offline.invalid", 122);
    const send = jest.spyOn(provider, "send").mockImplementation(async method => {
      if (method === "eth_accounts") return [account];
      throw new Error("Unexpected RPC method");
    });
    const sdk = new BaseSDK(provider, "production");
    await flush();
    expect(await sdk.getContract("GoodDollar").signer.getAddress()).toBe(account);
    expect(sdk.getContract("GoodDollar").signer.provider).toBe(provider);
    expect(send.mock.calls.every(([method]) => method === "eth_accounts")).toBe(true);
  });

  it("keeps an unsigned read contract when a JSON-RPC provider has no accounts", async () => {
    const provider = new providers.StaticJsonRpcProvider("https://offline.invalid", 122);
    jest.spyOn(provider, "send").mockResolvedValue([]);
    const sdk = new BaseSDK(provider, "production");
    await flush();
    expect(sdk.signer).toBeUndefined();
    expect(sdk.getContract("GoodDollar").provider).toBe(provider);
  });
});
