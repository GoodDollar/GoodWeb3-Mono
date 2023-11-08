import { Contract } from "ethers";
import * as ethers from "ethers";
import { useCall, useEthers } from "@usedapp/core";

import { useContractFunctionWithDefaultGasFees } from "../../sdk";

const buygdFactory = new Contract("0x4DD72A83c3aF02F82775bFEE2673Ef100d58dE13", [
  "function createAndSwap(address owner,uint256 minAmount) external returns(address)",
  "function createDonationAndSwap(address owner,address donateOrExecTo,bool withSwap,uint256 minAmount,bytes callData)",
  "function predict(address owner) external view returns(address)",
  "function predictDonation(address owner,address donateTo, bytes callData) external view returns(address)"
]);

export const useBuyGd = ({
  donateOrExecTo,
  callData,
  backendSwapUrl,
  withSwap
}: {
  donateOrExecTo?: string;
  callData?: string;
  backendSwapUrl?: string;
  withSwap?: boolean;
}) => {
  const { account, chainId } = useEthers();

  const targetGDHelper = useCall(
    account &&
      buygdFactory && {
        contract: buygdFactory,
        method: donateOrExecTo ? "predictDonation" : "predict",
        args: donateOrExecTo ? [account] : [account, donateOrExecTo, callData]
      },

    { refresh: "never", chainId }
  );

  const gdHelperAddress = targetGDHelper?.value?.[0];

  const buygdInstance = new Contract(gdHelperAddress || ethers.constants.AddressZero, [
    "function swap(uint256 minAmount,address gasRefund) external",
    "function exec(uint256 _minAmount,address refundGas,bool withSwap) external"
  ]);

  const { send: swapSend, state: swapState } = useContractFunctionWithDefaultGasFees(
    buygdInstance,
    donateOrExecTo ? "exec" : "swap",
    {
      transactionName: "Exchange bought tokens to G$"
    }
  );

  const { send: createAndSwapSend, state: createState } = useContractFunctionWithDefaultGasFees(
    buygdFactory,
    donateOrExecTo ? "createDonationAndSwap" : "createAndSwap",
    {
      transactionName: "Deploy secure swap helper"
    }
  );

  const createAndSwap = async (minAmount: ethers.BigNumberish) => {
    return donateOrExecTo
      ? createAndSwapSend(account, donateOrExecTo, withSwap, minAmount, callData)
      : createAndSwapSend(account, minAmount);
  };

  const swap = async (minAmount: ethers.BigNumberish) => {
    return donateOrExecTo ? swapSend(minAmount, account, withSwap) : swapSend(minAmount, account);
  };

  const triggerSwapTx = async () =>
    fetch(backendSwapUrl ?? `https://good-server.herokuapp.com/verify/swaphelper`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ account })
    });

  return { createAndSwap, swap, triggerSwapTx, swapState, createState, gdHelperAddress };
};
