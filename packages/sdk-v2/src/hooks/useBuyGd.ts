import { Contract } from "ethers";
import * as ethers from "ethers";
import { useCall, useEthers } from "@usedapp/core";

import { useContractFunctionWithDefaultGasFees } from "../sdk";

export const useBuyGd = () => {
  const { account, chainId } = useEthers();
  const buygdFactory = new Contract("0x00e533B7d6255D05b7f15034B1c989c21F51b91C", [
    "function createAndSwap(address owner,uint256 minAmount) external returns(address)",
    "function predict(address owner) external view returns(address)"
  ]);

  const targetGDHelper = useCall(
    account &&
      buygdFactory && {
        contract: buygdFactory,
        method: "predict",
        args: [account]
      },

    { refresh: "never", chainId }
  );

  const gdHelperAddress = targetGDHelper?.value?.[0];

  const buygdInstance = new Contract(gdHelperAddress || ethers.constants.AddressZero, [
    "function swap(uint256 minAmount,address gasRefund) external"
  ]);

  const { send: swap, state: swapState } = useContractFunctionWithDefaultGasFees(buygdInstance, "swap", {
    transactionName: "Exchange bought tokens to G$"
  });

  const { send: createAndSwap, state: createState } = useContractFunctionWithDefaultGasFees(
    buygdFactory,
    "createAndSwap",
    {
      transactionName: "Deploy secure swap helper"
    }
  );

  return { createAndSwap, swap, swapState, createState, gdHelperAddress };
};
