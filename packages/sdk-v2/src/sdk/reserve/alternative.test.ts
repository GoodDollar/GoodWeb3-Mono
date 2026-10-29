import { BigNumber, Contract, providers } from "ethers";

import { checkReserveAlternative } from "./alternative";

jest.mock("ethers", () => ({
  ...jest.requireActual("ethers"),
  Contract: jest.fn()
}));

describe("checkReserveAlternative provider compatibility", () => {
  it("uses getNetwork with a FallbackProvider and remains read-only", async () => {
    const children = [
      new providers.StaticJsonRpcProvider("https://first.offline.invalid", 42220),
      new providers.StaticJsonRpcProvider("https://second.offline.invalid", 42220)
    ];
    const childSends = children.map(child => jest.spyOn(child, "send"));
    const provider = new providers.FallbackProvider(children, 1);
    jest.spyOn(provider, "getNetwork").mockResolvedValue({ chainId: 42220, name: "celo" });
    jest.spyOn(provider, "getBlock").mockResolvedValue({
      number: 100,
      timestamp: Math.floor(Date.now() / 1000)
    } as providers.Block);
    expect((provider as any).send).toBeUndefined();

    const goodDollar = "0x0000000000000000000000000000000000000001";
    const reserveToken = "0x0000000000000000000000000000000000000002";
    const exchangeProvider = "0x0000000000000000000000000000000000000003";
    const brokerAddress = "0x0000000000000000000000000000000000000004";
    (Contract as unknown as jest.Mock).mockImplementation((address: string) => {
      if (address === exchangeProvider) {
        return {
          getExchanges: jest
            .fn()
            .mockResolvedValue([{ exchangeId: `0x${"1".repeat(64)}`, assets: [goodDollar, reserveToken] }])
        };
      }
      if (address === brokerAddress) {
        return {
          getAmountOut: jest.fn().mockResolvedValue(BigNumber.from("1000000000000000000")),
          tradingLimitsConfig: jest.fn().mockResolvedValue({ flags: 0 }),
          tradingLimitsState: jest.fn().mockResolvedValue({})
        };
      }
      return { decimals: jest.fn().mockResolvedValue(18) };
    });

    await expect(
      checkReserveAlternative(
        provider,
        42220,
        { MentoBroker: brokerAddress, MentoExchangeProvider: exchangeProvider, GoodDollar: goodDollar },
        { buying: false, exactInput: { input: "1", minAmountOut: "0.5" } }
      )
    ).resolves.toMatchObject({ chainId: 42220 });

    expect(provider.getNetwork).toHaveBeenCalledTimes(1);
    expect(childSends.every(send => send.mock.calls.length === 0)).toBe(true);
  });
});
