import React, { useMemo, useContext } from 'react'
import { ethers, Signer } from 'ethers'
import { EnvKey, EnvValue } from './sdk'
import { Web3Context } from '../../contexts'
import { useEthers, useConfig } from '@usedapp/core'
import { ClaimSDK } from '../claim/sdk'
import { SavingsSDK } from '../savings/sdk'
import { BaseSDK } from './sdk'
import Contracts from '@gooddollar/goodprotocol/releases/deployment.json'
import { useReadOnlyProvider, getReadOnlyProvider } from "../../hooks/useMulticallAtChain";

export const NAME_TO_SDK: { [key: string]: (typeof ClaimSDK | typeof SavingsSDK) } = {
  claim: ClaimSDK,
  savings: SavingsSDK
};

type RequestedSdk = {
  sdk: ClaimSDK | SavingsSDK | undefined,
  readOnly: boolean
}

export type SdkTypes = 'claim' | 'savings'

export const useReadOnlySDK = (type: SdkTypes, env?: EnvKey): RequestedSdk["sdk"] => {
  return useSDK(true, type, env);
};

export const useGetEnvChainId = (env?: EnvKey) => {
  const web3Context = useContext(Web3Context);
  const defaultEnv = env || web3Context.env;

  return {
    chainId: (Contracts[defaultEnv as keyof typeof Contracts] as EnvValue).networkId,
    defaultEnv,
    switchNetworkRequest: web3Context.switchNetwork
  };
};

export const useGetContract = (contractName: string, readOnly: boolean = false, type?: SdkTypes, env?: EnvKey) => {
  const sdk = useSDK(readOnly, type, env);
  return useMemo(() => sdk?.getContract(contractName), [contractName, , sdk]);
};

export const getSigner = async (signer: void | Signer, account: string) => {
  const isSigner = Signer.isSigner(signer) && await signer.getAddress() === account && signer
  if (!isSigner) return new Error('no signer or wrong signer')
  return signer
}

export const useSDK = (readOnly: boolean = false, type = 'base', env?: EnvKey): RequestedSdk["sdk"] => {
  const { readOnlyUrls, pollingInterval} = useConfig() // note: polling-interval doesn't seem to take effect, (queryParams[refresh] does!)
  const { library } = useEthers();
  const { chainId, defaultEnv } = useGetEnvChainId(readOnly ? undefined : env); 
  
  // const rolibrary = useReadOnlyProvider(chainId) || library;
  const rolibrary = getReadOnlyProvider(chainId, readOnlyUrls, pollingInterval) ?? library
  const activeEnv = type === 'savings' ? env?.split("-")[0] : env;
  // console.log('roLibrary / library -->', {rolibrary, library})
  // TODO: use create ref
  const sdk = useMemo<ClaimSDK | SavingsSDK | undefined>(() => {
    console.log('new sdk generating. . .')
    const reqSdk = NAME_TO_SDK[type]
    if (readOnly && rolibrary) {
      console.log('sdk ro initialize')
      return new reqSdk(rolibrary, activeEnv);
    } else if (library) {
      console.log('sdk initialize with lib')
      return new reqSdk(library, defaultEnv);
    } 
    // else {
    //   return new reqSdk(new ethers.providers.AlchemyProvider(chainId), defaultEnv) as BaseSDK;
    // }
  }, [chainId]) //TODO: temp
  // }, [library, rolibrary, readOnly, chainId, defaultEnv, activeEnv]); //TODO-note: which deps to give the least amount of re-renders

  return sdk
};