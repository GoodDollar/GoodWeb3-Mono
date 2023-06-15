import React, { useCallback, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers, Contract } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { useContractFunctionWithDefaultGasFees } from "@gooddollar/web3sdk-v2";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
// import {
//   IGoodDollar,
// } from "@gooddollar/goodprotocol/types";
import GoodDollarABI from "@gooddollar/goodprotocol/artifacts/abis/IGoodDollar.min.json";

interface CustomProps {
  signer?: JsonRpcSigner;
}

const useTestContractFunction = (params: CustomProps) => {
  const { signer } = params;
  const { account } = useEthers();
  const gdContract = new Contract(Contracts["fuse"].GoodDollar, GoodDollarABI.abi, signer) as any;

  const { state: transferState, send: sendTransfer } = useContractFunctionWithDefaultGasFees(
    gdContract,
    "transferAndCall",
    {
      transactionName: "SelfTransfer"
    }
  );

  const send = useCallback(async () => {
    const callData = ethers.constants.HashZero;
    const sendTen = await sendTransfer(account, "10000", callData);
    console.log("sending 10.... -->", { sendTen });
  }, [account, sendTransfer, signer]);

  return { send, transferState };
};

export default useTestContractFunction;
