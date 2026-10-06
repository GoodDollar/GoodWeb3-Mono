import { BigNumber, BigNumberish, Contract, providers, utils } from "ethers";

const brokerAbi = [
  "function getAmountOut(address,bytes32,address,address,uint256) view returns (uint256)",
  "function getAmountIn(address,bytes32,address,address,uint256) view returns (uint256)",
  "function tradingLimitsConfig(bytes32) view returns (tuple(uint32 timestep0,uint32 timestep1,int48 limit0In,int48 limit0Out,int48 limit1In,int48 limit1Out,int48 limitGlobal,uint8 flags))",
  "function tradingLimitsState(bytes32) view returns (tuple(uint32 lastUpdated0,uint32 lastUpdated1,int48 netflow0,int48 netflow1,int48 netflowGlobal))"
];
const exchangeAbi = ["function getExchanges() view returns (tuple(bytes32 exchangeId,address[] assets)[])"];
const tokenAbi = ["function decimals() view returns (uint8)"];
const maxInt48 = BigNumber.from(2).pow(47).sub(1);
const minInt48 = BigNumber.from(2).pow(47).mul(-1);
const maxInt256 = BigNumber.from(2).pow(255).sub(1);

interface LimitConfig {
  flags: number;
  timestep0: number;
  timestep1: number;
  limit0In: BigNumberish;
  limit0Out: BigNumberish;
  limit1In: BigNumberish;
  limit1Out: BigNumberish;
  limitGlobal: BigNumberish;
}

interface LimitState {
  lastUpdated0: number;
  lastUpdated1: number;
  netflow0: BigNumberish;
  netflow1: BigNumberish;
  netflowGlobal: BigNumberish;
}

export interface ReserveAlternative {
  chainId: number;
  /** Local verification time, used internally to discard stale recommendations. */
  checkedAt: number;
}

export interface ReserveAlternativeRequest {
  buying: boolean;
  // Human token units, normalized separately using each chain's discovered decimals.
  exactInput?: { input: string; minAmountOut: string };
  exactOutput?: { output: string; maxAmountIn: string };
}

/** Match the deployed TradingLimits.update/verify rules without exposing headroom to the UI. */
export const areReserveLimitsSatisfied = (
  config: LimitConfig,
  state: LimitState,
  amount: BigNumber,
  decimals: number,
  inflow: boolean,
  chainTimestamp: number
): boolean => {
  if (config.flags & ~7 || amount.lte(0) || amount.gt(maxInt256) || decimals < 0 || decimals > 77) return false;
  if (!config.flags) return true;
  // Solidity truncates fractional whole-token units, but a nonzero sub-token flow counts as one.
  let delta = amount.div(BigNumber.from(10).pow(decimals));
  if (delta.isZero()) delta = BigNumber.from(1);
  if (!inflow) delta = delta.mul(-1);
  if (delta.gt(maxInt48) || delta.lt(minInt48)) return false;

  const within = (netflow: BigNumberish, limitIn: BigNumberish, limitOut: BigNumberish) => {
    const next = BigNumber.from(netflow).add(delta);
    // Equivalently, outflow headroom is limitOut + effectiveNetflow.
    return next.gte(minInt48) && next.lte(maxInt48) && next.gte(BigNumber.from(limitOut).mul(-1)) && next.lte(limitIn);
  };
  if (config.flags & 1) {
    const flow = chainTimestamp > state.lastUpdated0 + config.timestep0 ? 0 : state.netflow0;
    if (!within(flow, config.limit0In, config.limit0Out)) return false;
  }
  if (config.flags & 2) {
    const flow = chainTimestamp > state.lastUpdated1 + config.timestep1 ? 0 : state.netflow1;
    if (!within(flow, config.limit1In, config.limit1Out)) return false;
  }
  if (config.flags & 4 && !within(state.netflowGlobal, config.limitGlobal, config.limitGlobal)) return false;
  return true;
};

export const getReserveLimitKey = (exchangeId: string, tokenAddress: string): string =>
  utils.hexZeroPad(BigNumber.from(exchangeId).xor(BigNumber.from(tokenAddress)).toHexString(), 32);

/** Read-only check of the target environment's pair, quote and every enabled limit on both legs. */
export const checkReserveAlternative = async (
  provider: providers.JsonRpcProvider,
  chainId: number,
  deployment: { MentoBroker?: string; MentoExchangeProvider?: string; GoodDollar?: string } | undefined,
  request: ReserveAlternativeRequest
): Promise<ReserveAlternative | undefined> => {
  if (!deployment?.MentoBroker || !deployment.MentoExchangeProvider || !deployment.GoodDollar) return undefined;
  if (!!request.exactInput === !!request.exactOutput) return undefined;
  const actualChainId = BigNumber.from(await provider.send("eth_chainId", [])).toNumber();
  if (actualChainId !== chainId) return undefined;
  const block = await provider.getBlock("latest");
  if (!block || Math.abs(Date.now() / 1000 - block.timestamp) > 60) return undefined;
  const overrides = { blockTag: block.number };
  const exchangeProvider = new Contract(deployment.MentoExchangeProvider, exchangeAbi, provider);
  const broker = new Contract(deployment.MentoBroker, brokerAbi, provider);
  const exchanges = (await exchangeProvider.getExchanges(overrides)) as { exchangeId: string; assets: string[] }[];
  const gd = deployment.GoodDollar.toLowerCase();
  // Follow the Reserve's default-pair discovery; never substitute an address from the active chain.
  const exchange = exchanges.find(
    pool => pool.assets.length === 2 && pool.assets.some(token => token.toLowerCase() === gd)
  );
  if (!exchange) return undefined;
  const reserveToken = exchange.assets.find(token => token.toLowerCase() !== gd);
  if (!reserveToken) return undefined;
  const inputToken = request.buying ? reserveToken : deployment.GoodDollar;
  const outputToken = request.buying ? deployment.GoodDollar : reserveToken;
  const [inputDecimals, outputDecimals] = (await Promise.all([
    new Contract(inputToken, tokenAbi, provider).decimals(overrides),
    new Contract(outputToken, tokenAbi, provider).decimals(overrides)
  ])) as [number, number];
  let amountIn: BigNumber;
  let amountOut: BigNumber;
  if (request.exactInput) {
    amountIn = utils.parseUnits(request.exactInput.input, inputDecimals);
    amountOut = await broker.getAmountOut(
      deployment.MentoExchangeProvider,
      exchange.exchangeId,
      inputToken,
      outputToken,
      amountIn,
      overrides
    );
    if (amountOut.lt(utils.parseUnits(request.exactInput.minAmountOut, outputDecimals))) return undefined;
  } else if (request.exactOutput) {
    amountOut = utils.parseUnits(request.exactOutput.output, outputDecimals);
    amountIn = await broker.getAmountIn(
      deployment.MentoExchangeProvider,
      exchange.exchangeId,
      inputToken,
      outputToken,
      amountOut,
      overrides
    );
    if (amountIn.gt(utils.parseUnits(request.exactOutput.maxAmountIn, inputDecimals))) return undefined;
  } else return undefined;
  const allowed = await Promise.all(
    [
      [inputToken, amountIn, inputDecimals, true],
      [outputToken, amountOut, outputDecimals, false]
    ].map(async leg => {
      const [token, amount, decimals, inflow] = leg as [string, BigNumber, number, boolean];
      const key = getReserveLimitKey(exchange.exchangeId, token);
      const [config, state] = (await Promise.all([
        broker.tradingLimitsConfig(key, overrides),
        broker.tradingLimitsState(key, overrides)
      ])) as [LimitConfig, LimitState];
      return areReserveLimitsSatisfied(config, state, amount, decimals, inflow, block.timestamp);
    })
  );
  return allowed.every(Boolean) ? { chainId, checkedAt: Date.now() } : undefined;
};

/** Bound failed/slow RPC checks; the original transaction flow must not depend on these reads. */
export const withReserveCheckTimeout = async <T>(check: Promise<T>): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      check,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Reserve alternative check timed out")), 10000);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};
