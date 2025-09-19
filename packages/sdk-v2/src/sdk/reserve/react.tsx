import { BigNumber, Contract } from "ethers";
import { ERC20Interface, QueryParams, useCall, useCalls, useTokenAllowance } from "@usedapp/core";
import contractAddresses from "@gooddollar/goodprotocol/releases/deployment.json";
import { useContractFunctionWithDefaultGasFees, useG$Tokens, useGetEnvChainId } from "../../sdk";
import { useRefreshOrNever } from "../../hooks";

const exchangeAbi = [
  "function currentPrice(bytes32 exchangeId) external view returns (uint256 price)",
  "function getExchangeIds() external view returns (bytes32[] ids)",
  "function getPoolExchange(bytes32 exchangeId) external view returns((address reserveAsset, address tokenAddress, uint256 tokenSupply, uint256 reserveBalance, uint32 reserveRatio, uint32 exitContribution) pool)",
  "function getExchanges() external view returns((bytes32 exchangeId,address[] assets)[] pools)"
];

const brokerAbi = [
  "function getAmountOut(address exchangeProvider,bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountIn) external view returns (uint256 amountOut)",
  "function getAmountIn(address exchangeProvider, bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountOut) external view returns (uint256 amountIn)",
  "function swapIn(address exchangeProvider,bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOutMin) external returns (uint256 amountOut)",
  "function swapOut(address exchangeProvider,bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountOut,uint256 amountInMax) external returns (uint256 amountIn)"
];

export const useExchangeId = () => {
  const { connectedEnv, chainId } = useGetEnvChainId();

  const mentoExchange = new Contract(
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C",
    exchangeAbi
  );
  const exchanges = useCall(
    mentoExchange && {
      contract: mentoExchange,
      method: "getExchanges",
      args: []
    },
    { refresh: "never", chainId }
  );

  const exchange = exchanges?.value?.pools?.find(e => e.assets.includes(contractAddresses[connectedEnv].GoodDollar));
  const exchangeId = exchange?.exchangeId;
  return exchangeId;
};

export const useG$Price = (refresh: QueryParams["refresh"] = 12): BigNumber | undefined => {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { connectedEnv, chainId } = useGetEnvChainId();

  const mentoReserve = new Contract(
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C",
    exchangeAbi
  );

  const exchangeId = useExchangeId();

  const price = useCall(
    exchangeId && {
      contract: mentoReserve,
      method: "currentPrice",
      args: [exchangeId]
    },
    { refresh: refreshOrNever, chainId }
  );

  return price?.value?.price;
};

export const useSwapMeta = (
  account: string,
  buying: boolean,
  slippageTolerance: number,
  input?: BigNumber,
  output?: BigNumber,
  refresh: QueryParams["refresh"] = 5
) => {
  const { connectedEnv } = useGetEnvChainId();
  const refreshOrNever = useRefreshOrNever(refresh);

  const g$Price = useG$Price(refresh);
  const [G$] = useG$Tokens();
  const cUSD = contractAddresses[connectedEnv].CUSD || "0xeed145D8d962146AFc568E9579948576f63D5Dc2";

  const exchangeProviderAddress =
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C";
  const mentoBroker = new Contract(
    contractAddresses[connectedEnv].MentoBroker || "0xE60cf1cb6a56131CE135c604D0BD67e84B57CA3C",
    brokerAbi
  );
  const mentoProvider = new Contract(exchangeProviderAddress, exchangeAbi);

  const g$Allowance = useTokenAllowance(G$.address, account, mentoBroker.address, { refresh: refreshOrNever });
  const cusdAllowance = useTokenAllowance(cUSD, account, mentoBroker.address, { refresh: refreshOrNever });

  const exchangeId = useExchangeId();
  const [exchange, amountOut, amountIn] = useCalls([
    exchangeId && {
      contract: mentoProvider,
      method: "getPoolExchange",
      args: [exchangeId]
    },
    exchangeId &&
      input && {
        contract: mentoBroker,
        method: "getAmountOut",
        args: [exchangeProviderAddress, exchangeId, buying ? cUSD : G$.address, buying ? G$.address : cUSD, input]
      },
    exchangeId &&
      output && {
        contract: mentoBroker,
        method: "getAmountIn",
        args: [exchangeProviderAddress, exchangeId, buying ? cUSD : G$.address, buying ? G$.address : cUSD, output]
      }
  ]);

  const minAmountOut = (output || amountOut?.value?.amountOut || BigNumber.from(0))
    .mul((10000 - slippageTolerance * 100).toFixed(0))
    .div(10000);

  return {
    minAmountOut,
    g$Price,
    g$Allowance,
    cusdAllowance,
    exitContribution: exchange?.value?.pool?.exitContribution / 1e8,
    amountIn: amountIn?.value?.amountIn,
    amountOut: amountOut?.value?.amountOut
  };
};

export const useSwap = (
  inputToken: string,
  outputToken: string,
  exactInput?: { input: string; minAmountOut: string },
  exactOutput?: { output: string; maxAmountIn: string }
) => {
  if (exactInput && exactOutput) throw new Error("Only one of exactInput or exactOutput can be specified");

  const { connectedEnv } = useGetEnvChainId();
  const exchangeId = useExchangeId();

  const exchangeProviderAddress =
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C";
  const mentoBroker = new Contract(
    contractAddresses[connectedEnv].MentoBroker || "0xE60cf1cb6a56131CE135c604D0BD67e84B57CA3C",
    brokerAbi
  );

  const approve = useContractFunctionWithDefaultGasFees(new Contract(inputToken, ERC20Interface), "approve");
  const { send } = approve;
  approve.send = () => send(mentoBroker.address, exactInput ? exactInput.input : exactOutput?.maxAmountIn);

  const swap = useContractFunctionWithDefaultGasFees(mentoBroker, exactInput ? "swapIn" : "swapOut");
  const { send: swapSend } = swap;
  // address exchangeProvider,bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOutMin
  swap.send = async () => {
    return swapSend(
      exchangeProviderAddress,
      exchangeId,
      inputToken,
      outputToken,
      exactInput?.input || exactOutput?.output,
      exactInput?.minAmountOut || exactOutput?.maxAmountIn
    );
  };
  return { approve, swap };
};
