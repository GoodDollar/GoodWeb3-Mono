import { getEffectiveWeb3Qa } from "./Web3Context";

jest.mock("../sdk", () => ({}));

describe("getEffectiveWeb3Qa", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("enables forceTradeLimits only when explicitly requested in a development build", () => {
    process.env.NODE_ENV = "production";
    expect(getEffectiveWeb3Qa({ forceTradeLimits: true })).toEqual({ forceTradeLimits: false });

    process.env.NODE_ENV = "test";
    expect(getEffectiveWeb3Qa({ forceTradeLimits: true })).toEqual({ forceTradeLimits: false });

    process.env.NODE_ENV = "development";
    expect(getEffectiveWeb3Qa()).toEqual({ forceTradeLimits: false });
    expect(getEffectiveWeb3Qa({ forceTradeLimits: false })).toEqual({ forceTradeLimits: false });
    expect(getEffectiveWeb3Qa({ forceTradeLimits: true })).toEqual({ forceTradeLimits: true });
  });
});
