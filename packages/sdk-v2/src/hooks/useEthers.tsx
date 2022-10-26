import { useMemo } from 'react'
import { useEthers as useDAppEthers } from "@usedapp/core";
import { ethers } from "ethers";

const { Web3Provider } = ethers.providers

const useEthers = () => {
  const { library, ...api } = useDAppEthers()
  const isWeb3 = useMemo(() => library instanceof Web3Provider, [library])

  return { isWeb3, library, ...api }
}

export default useEthers
