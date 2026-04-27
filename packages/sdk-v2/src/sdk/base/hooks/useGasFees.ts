import { useContractFunction, useEthers } from "@usedapp/core";
import { useCallback, useEffect, useState } from "react";
import { pickBy } from "lodash";
import { FeeData } from "@ethersproject/providers";
import {
  ContractFunctionNames,
  Falsy,
  Params,
  TransactionOptions,
  TypedContract
} from "@usedapp/core/dist/esm/src/model";
import { BigNumber } from "ethers";

// force gasPrice for fuse/celo
export const useGasFees = () => {
  const { library } = useEthers();
  const [fees, setFees] = useState<FeeData>({
    gasPrice: BigNumber.from(30e9),
    maxFeePerGas: BigNumber.from(30e9),
    maxPriorityFeePerGas: BigNumber.from(1e8),
    lastBaseFeePerGas: BigNumber.from(30e9)
  } as FeeData);

  useEffect(() => {
    if (library) {
      void library.getFeeData().then(fees => {
        setFees(fees);
      });
    }
  }, [library]);
  return fees;
};

// wrap usedapp useContractFunction with default gas price for fuse/celo
export function useContractFunctionWithDefaultGasFees<T extends TypedContract, FN extends ContractFunctionNames<T>>(
  contract: T | Falsy,
  functionName: FN,
  options?: TransactionOptions,
  estGasEnabled = true
) {
  const { send, ...rest } = useContractFunction(contract, functionName, options);
  const gasFees = useGasFees();
  const newSend = useCallback(
    async (...args: Params<T, FN>) => {
      if (contract) {
        const numberOfArgs = contract.interface.getFunction(functionName).inputs.length;
        const hasOpts = args.length > numberOfArgs;
        const opts = hasOpts ? args[args.length - 1] : {};
        const modifiedArgs = hasOpts ? args.slice(0, args.length - 1) : args;
        // put default gas fees. use gasPrice value instead of maxFeePerGas because maxFeePerGas uses a very large buffer.
        if (estGasEnabled) {
          modifiedArgs.push(
            pickBy(
              { ...{ maxFeePerGas: gasFees?.gasPrice, maxPriorityFeePerGas: gasFees?.maxPriorityFeePerGas }, ...opts },
              _ => _ != null
            )
          );
        }

        return send(...(modifiedArgs as any));
      }
    },
    [gasFees, send]
  );
  return { ...rest, send: newSend };
}
