import { useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { useCallback, useMemo } from "react";
import { pickBy } from "lodash";
import {
  ContractFunctionNames,
  Falsy,
  Params,
  TransactionOptions,
  TypedContract
} from "@usedapp/core/dist/esm/src/model";

// force gasPrice for fuse/celo
export const useGasFees = () => {
  const { chainId } = useEthers();
  const gasPrice = useMemo(() => {
    //force gas price for celo and ethereum
    switch (chainId) {
      case 122:
        return BigNumber.from(11e9);
      case 42220:
        return BigNumber.from(100e9); // Increased to 100e9 to handle very high base fees
    }
  }, [chainId]);

  return pickBy({ gasPrice }, _ => _ != null);
};

// wrap usedapp useContractFunction with default gas price for fuse/celo
export function useContractFunctionWithDefaultGasFees<T extends TypedContract, FN extends ContractFunctionNames<T>>(
  contract: T | Falsy,
  functionName: FN,
  options?: TransactionOptions
) {
  const { chainId } = useEthers();
  const { send, ...rest } = useContractFunction(contract, functionName, options);
  const gasFees = useGasFees();
  const newSend = useCallback(
    async (...args: Params<T, FN>) => {
      if (contract) {
        const numberOfArgs = contract.interface.getFunction(functionName).inputs.length;
        const hasOpts = args.length > numberOfArgs;
        const opts = hasOpts ? args[args.length - 1] : {};
        const modifiedArgs = hasOpts ? args.slice(0, args.length - 1) : args;

        console.log("arguments useGasFees -->", { opts, modifiedArgs, chainId });

        // Add a reasonable gas limit for bridge transactions to prevent estimation failures
        const gasOptions =
          "maxFeePerGas" in opts
            ? {
                ...opts,
                ...(chainId === 42220
                  ? {
                      maxFeePerGas: 100e9, // Increased to 100 gwei to handle very high base fees
                      maxPriorityFeePerGas: 5e9 // Increased to 5 gwei priority fee
                    }
                  : {})
              }
            : { ...gasFees, ...opts };

        if (!gasOptions.gasLimit) {
          gasOptions.gasLimit = BigNumber.from("500000"); // 500k gas limit for bridge transactions
        }

        // Ensure gas price is high enough for current network conditions
        if (chainId === 42220 && gasOptions.gasPrice && gasOptions.gasPrice.lt(BigNumber.from("100e9"))) {
          gasOptions.gasPrice = BigNumber.from("100e9"); // Ensure minimum 100 gwei for Celo
        }

        console.log("Final gas options:", gasOptions);
        modifiedArgs.push(pickBy(gasOptions, _ => _ != null));
        return send(...(modifiedArgs as any));
      }
    },
    [gasFees, send]
  );
  return { ...rest, send: newSend };
}
