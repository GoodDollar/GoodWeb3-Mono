import React from "react";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
export const useNativeBalance = () => {
  const { account } = useEthers();
  const nativeBalance = useEtherBalance(account);
  if (nativeBalance) {
    const formattedBalance = formatEther(nativeBalance);
    return parseFloat(formattedBalance).toFixed(6);
  }
};
