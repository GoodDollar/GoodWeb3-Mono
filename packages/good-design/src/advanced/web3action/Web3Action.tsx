import React, { useEffect, useCallback } from 'react';
// import { GooddollarThemeProvider, theme } from '../../core/provider/ThemeProvider';
import type { IButtonProps } from 'native-base/lib/typescript/components/primitives/Button/types';
import { BaseButton } from '../../core/buttons/';
import { useEthers } from '@usedapp/core';
import { TransactionReceipt } from '@ethersproject/providers'

export interface Web3ActionProps {
  /**
   * a text to be rendered in the component.
   */
  text: string,
  requiredChain: number,
  doAction: () => Promise<TransactionReceipt | undefined>,
  handleSwitch?: (() => Promise<number>) | undefined,
  handleConnect?: ((requiredChain: number) => Promise<any>) | undefined 
};


export const Web3ActionButton = ({
  text, 
  requiredChain, 
  doAction, 
  handleSwitch = undefined, 
  handleConnect = undefined
}: Web3ActionProps):JSX.Element => {
  const {
    account, 
    switchNetwork, 
    chainId, 
    library, 
    active, 
    activateBrowserWallet, 
    activate, 
    deactivate, 
    error } = useEthers()

  const onPress = useCallback(async() => {
    console.log('account/onConnect -->', {account, handleConnect})
    if (!account && !handleConnect) {
      console.log('no account . . .')
      console.log('library/account/chainId -->', {library, account, chainId})
      activateBrowserWallet()
    } 
    // else if (!account) {
    //   handleConnect(requiredChain).then((res) => {
    //     return doAction()
    //   })
    // }

    if (chainId !== requiredChain){
      switchNetwork(requiredChain).then((res) => {
        return doAction()
      })
    }
  }, [account, chainId])

    // useEffect(() => {
    //   console.log('account -->', {account}) 
    //   if (library){
    //     console.log('library -->', {library})
    //   }
    //   console.log('error -->', {error})
    // }, [account, library, error])

  return (
    <BaseButton text={text} onPress={onPress} />
  );
}
