import { useCallback, useMemo, useRef, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { ERC20Interface, QueryParams, useCall, useCalls, useEthers, useTokenAllowance } from "@usedapp/core";

import contractAddresses from "@gooddollar/goodprotocol/releases/deployment.json";
import { useG$Tokens, useGetEnvChainId } from "../base/react";
import { useGasFees } from "../base/hooks/useGasFees";
import { useRefreshOrNever } from "../../hooks";
import { getReserveLimitReason, RESERVE_LIMIT_ERROR, ReserveTransactionStatus } from "./errors";
import { checkReserveAlternative, ReserveAlternative, withReserveCheckTimeout } from "./alternative";
import { useReadOnlyProvider } from "../../hooks/useMulticallAtChain";

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

export const useExchange = (requiredChainId?: number) => {
  const { connectedEnv, chainId } = useGetEnvChainId(requiredChainId);

  const mentoExchange = useMemo(
    () =>
      new Contract(
        contractAddresses[connectedEnv]?.MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C",
        exchangeAbi
      ),
    [connectedEnv, chainId]
  );

  const callData = useMemo(
    () =>
      mentoExchange && {
        contract: mentoExchange,
        method: "getExchanges",
        args: []
      },
    [mentoExchange.address]
  );

  const exchanges = useCall(callData, { refresh: "never", chainId });

  const exchange = exchanges?.value?.pools?.find(e => e.assets.includes(contractAddresses[connectedEnv].GoodDollar));

  return useMemo(() => {
    return { exchange, exchangeId: exchange?.exchangeId };
  }, [exchange?.assets?.toString()]);
};

export const useReserveToken = (requiredChainId?: number) => {
  const { connectedEnv, chainId } = useGetEnvChainId(requiredChainId);
  const { exchange } = useExchange(requiredChainId);
  const gdAddress = contractAddresses[connectedEnv]?.GoodDollar;
  const reserveAsset = exchange?.assets.find(_ => _.toLowerCase() !== gdAddress.toLowerCase());
  // console.log("useReserveToken:", { connectedEnv, exchange, gdAddress, reserveAsset });
  // 1) memoize the Contract
  const contract = useMemo(
    () => new Contract(reserveAsset || ethers.constants.AddressZero, ERC20Interface),
    [reserveAsset]
  );

  // 2) build a stable calls array
  const calls = useMemo(
    () =>
      reserveAsset
        ? [
            { contract, method: "decimals", args: [] },
            { contract, method: "symbol", args: [] },
            { contract, method: "name", args: [] }
          ]
        : [],
    [reserveAsset, contract]
  );

  const results = useCalls(calls, { refresh: "never", chainId }) ?? [];

  // 3) inline nullish fallbacks
  const decimals = results[0]?.value?.[0] ?? 18;
  const symbol = results[1]?.value?.[0] ?? "cUSD";
  const name = results[2]?.value?.[0] ?? "Celo USD";

  return useMemo(
    () => ({ chainId, address: reserveAsset, decimals, symbol, name }),
    [chainId, reserveAsset, decimals, symbol, name]
  );
};

export const useG$Price = (refresh: QueryParams["refresh"] = 12, requiredChainId?: number): BigNumber | undefined => {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { connectedEnv, chainId } = useGetEnvChainId(requiredChainId);

  const mentoReserve = new Contract(
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C",
    exchangeAbi
  );

  const { exchangeId } = useExchange(requiredChainId);

  const callData = useMemo(
    () =>
      exchangeId && {
        contract: mentoReserve,
        method: "currentPrice",
        args: [exchangeId]
      },
    [mentoReserve.address, exchangeId]
  );
  const price = useCall(callData, { refresh: refreshOrNever, chainId });

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
  // console.log("useSwapMeta inputs:", { buying, input });
  const { connectedEnv } = useGetEnvChainId();
  const refreshOrNever = useRefreshOrNever(refresh);

  const g$Price = useG$Price(refresh);
  const [G$] = useG$Tokens();
  const reserveAsset = useReserveToken();
  const cUSD = reserveAsset.address || "0xeed145D8d962146AFc568E9579948576f63D5Dc2";

  const exchangeProviderAddress =
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C";
  const mentoBroker = new Contract(
    contractAddresses[connectedEnv].MentoBroker || "0xE60cf1cb6a56131CE135c604D0BD67e84B57CA3C",
    brokerAbi
  );
  const mentoProvider = new Contract(exchangeProviderAddress, exchangeAbi);

  const g$Allowance = useTokenAllowance(G$.address, account, mentoBroker.address, { refresh: refreshOrNever });
  const cusdAllowance = useTokenAllowance(cUSD, account, mentoBroker.address, { refresh: refreshOrNever });

  const { exchangeId } = useExchange();
  const callData = useMemo(
    () => [
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
    ],
    [exchangeId, exchangeProviderAddress, buying, reserveAsset.address, G$.address, input?._hex, output?._hex]
  );
  const [exchange, amountOut, amountIn] = useCalls(callData);

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
    amountOut: amountOut?.value?.amountOut,
    exchangeId,
    mentoBroker: mentoBroker.address,
    reserveAsset: reserveAsset.address,
    g$: G$.address
  };
};

// Submit directly, as in MPBBridge: usedapp assumes every account with bytecode is a Safe,
// including EOAs carrying an EIP-7702 delegation (for example MetaMask gas delegation).
const useReserveContractFunction = (contract: Contract, functionName: string) => {
  const { account, chainId, library } = useEthers();
  const gasFees = useGasFees();
  const [state, setState] = useState<ReserveTransactionStatus>({ status: "None" });
  const [events, setEvents] = useState<ethers.utils.LogDescription[] | undefined>();
  const resetState = useCallback(() => setState({ status: "None" }), []);

  const send = useCallback(
    async (...args: any[]) => {
      if (!library || !account || !chainId) {
        setState({ status: "Exception", chainId, errorMessage: "Wallet is not connected" });
        return undefined;
      }

      let transaction: ethers.providers.TransactionResponse | undefined;
      setEvents(undefined);
      setState({ status: "PendingSignature", chainId });

      try {
        const signer = (library as ethers.providers.Web3Provider).getSigner(account);
        const contractWithSigner = contract.connect(signer);
        const overrides: ethers.Overrides = {};
        // Match useContractFunctionWithDefaultGasFees without entering usedapp's Safe detection.
        if (gasFees.gasPrice != null) overrides.maxFeePerGas = gasFees.gasPrice;
        if (gasFees.maxPriorityFeePerGas != null) overrides.maxPriorityFeePerGas = gasFees.maxPriorityFeePerGas;
        transaction = (await contractWithSigner[functionName](
          ...args,
          overrides
        )) as ethers.providers.TransactionResponse;
        setState({ status: "Mining", transaction, chainId });

        const receipt = await transaction.wait();
        const failed = receipt.status === 0;
        setState({
          status: failed ? "Fail" : "Success",
          transaction,
          receipt,
          chainId,
          errorMessage: failed ? "Reserve transaction failed" : undefined
        });
        setEvents(
          receipt.logs.reduce<ethers.utils.LogDescription[]>((parsed, log) => {
            try {
              if (log.address.toLowerCase() === contract.address.toLowerCase()) {
                parsed.push(contract.interface.parseLog(log));
              }
            } catch {
              // Ignore logs not described by the contract ABI.
            }
            return parsed;
          }, [])
        );
        return receipt;
      } catch (error: any) {
        // ethers rejects wait() for mined reverts and replacement transactions.
        const receipt = error?.receipt as ethers.providers.TransactionReceipt | undefined;
        if (transaction && error?.code === "TRANSACTION_REPLACED" && !error.cancelled && receipt) {
          setState({
            status: receipt.status === 0 ? "Fail" : "Success",
            transaction: error.replacement,
            originalTransaction: transaction,
            receipt,
            chainId,
            originalError: receipt.status === 0 ? error : undefined,
            errorType: receipt.status === 0 && getReserveLimitReason(error) ? RESERVE_LIMIT_ERROR : undefined,
            errorMessage: receipt.status === 0 ? "Reserve transaction failed" : undefined
          });
          return receipt;
        }
        setState({
          status: transaction ? "Fail" : "Exception",
          transaction,
          receipt,
          chainId,
          originalError: error,
          errorType: getReserveLimitReason(error) ? RESERVE_LIMIT_ERROR : undefined,
          errorMessage:
            error?.error?.data?.message ||
            error?.error?.message ||
            error?.reason ||
            error?.data?.message ||
            error?.message ||
            "Reserve transaction failed"
        });
        return undefined;
      }
    },
    [account, chainId, library, contract, functionName, gasFees]
  );

  return { state, send, resetState, events };
};

export const useSwap = (
  inputToken: string,
  outputToken: string,
  exactInput?: { input: string; minAmountOut: string },
  exactOutput?: { output: string; maxAmountIn: string }
) => {
  if (exactInput && exactOutput) throw new Error("Only one of exactInput or exactOutput can be specified");

  const { connectedEnv } = useGetEnvChainId();
  const { chainId } = useEthers();
  const otherChainId = chainId === 42220 ? 50 : 42220;
  const { defaultEnv: otherEnv } = useGetEnvChainId(otherChainId);
  const sourceProvider = useReadOnlyProvider(chainId ?? 42220);
  const otherProvider = useReadOnlyProvider(otherChainId);
  const lastAlternativeCheck = useRef<() => Promise<ReserveAlternative | undefined>>();
  const checkAlternativeReserve = useCallback(async () => {
    try {
      return await withReserveCheckTimeout(lastAlternativeCheck.current?.() ?? Promise.resolve(undefined));
    } catch {
      // Missing deployments, unsupported pairs, failed or stale RPC reads use the generic UI suggestion.
      return undefined;
    }
  }, []);
  const { exchangeId } = useExchange();

  const exchangeProviderAddress =
    contractAddresses[connectedEnv].MentoExchangeProvider || "0x558eC7E55855FAC9403De3ADB3aa1e588234A92C";
  const mentoBroker = useMemo(
    () =>
      new Contract(
        contractAddresses[connectedEnv].MentoBroker || "0xE60cf1cb6a56131CE135c604D0BD67e84B57CA3C",
        brokerAbi
      ),
    [contractAddresses[connectedEnv].MentoBroker]
  );

  const tokenContract = useMemo(() => new Contract(inputToken, ERC20Interface), [inputToken]);
  const approve = useReserveContractFunction(tokenContract, "approve");
  const { send } = approve;
  approve.send = () => send(mentoBroker.address, exactInput ? exactInput.input : exactOutput?.maxAmountIn);

  const swap = useReserveContractFunction(mentoBroker, exactInput ? "swapIn" : "swapOut");
  const { send: swapSend } = swap;
  // address exchangeProvider,bytes32 exchangeId,address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOutMin
  swap.send = async () => {
    // Snapshot the submitted swap: the legacy UI clears its amount fields once mining starts.
    // These reads run only when requested after a limit error and never touch the wallet signer.
    lastAlternativeCheck.current = async () => {
      if (!sourceProvider || !otherProvider || (chainId !== 42220 && chainId !== 50)) return undefined;
      const sourceGd = contractAddresses[connectedEnv]?.GoodDollar?.toLowerCase();
      const buying = outputToken.toLowerCase() === sourceGd;
      if (!buying && inputToken.toLowerCase() !== sourceGd) return undefined;
      const [inputDecimals, outputDecimals] = (await Promise.all([
        tokenContract.connect(sourceProvider).decimals(),
        new Contract(outputToken, ERC20Interface, sourceProvider).decimals()
      ])) as [number, number];
      return checkReserveAlternative(otherProvider, otherChainId, contractAddresses[otherEnv], {
        buying,
        exactInput: exactInput && {
          input: ethers.utils.formatUnits(exactInput.input, inputDecimals),
          minAmountOut: ethers.utils.formatUnits(exactInput.minAmountOut, outputDecimals)
        },
        exactOutput: exactOutput && {
          output: ethers.utils.formatUnits(exactOutput.output, outputDecimals),
          maxAmountIn: ethers.utils.formatUnits(exactOutput.maxAmountIn, inputDecimals)
        }
      });
    };
    return swapSend(
      exchangeProviderAddress,
      exchangeId,
      inputToken,
      outputToken,
      exactInput?.input || exactOutput?.output,
      exactInput?.minAmountOut || exactOutput?.maxAmountIn
    );
  };
  return { approve, swap, checkAlternativeReserve };
};
