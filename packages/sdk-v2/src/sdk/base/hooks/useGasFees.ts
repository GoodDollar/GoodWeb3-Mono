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
        return BigNumber.from(25.001e9);
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

        modifiedArgs.push(
          pickBy(
            "maxFeePerGas" in opts
              ? {
                  ...opts,
                  ...(chainId === 42220
                    ? { maxFeePerGas: 25.001e9, maxPriorityFeePerGas: 1e8 }
                    : chainId === 50
                    ? { maxFeePerGas: 12.5e9 }
                    : {})
                }
              : { ...gasFees, ...opts },
            _ => _ != null
          )
        );
        return send(...(modifiedArgs as any));
      }
    },
    [gasFees, send]
  );
  return { ...rest, send: newSend };
}
