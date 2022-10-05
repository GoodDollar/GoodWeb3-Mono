import React, { useCallback } from 'react';
import { noop } from 'lodash'
import { BaseButton } from '../../core/buttons';
import { useEthers } from '@usedapp/core';
import { TransactionReceipt } from '@ethersproject/providers'


//This is just a draft

export interface Web3ActionProps {
  /**
   * a text to be rendered in the component.
   */
  text: string,
  requiredChain: number,
  doAction: () => Promise<TransactionReceipt | undefined>,
  handleConnect?: ((requiredChain: number) => Promise<any> | void)
};


export const Web3ActionButton = ({
  text,
  requiredChain,
  doAction,
  handleConnect = noop
}: Web3ActionProps): JSX.Element => {
  const {
    account,
    switchNetwork,
    chainId,
    library,
    activateBrowserWallet
  } = useEthers()

  const onPress = useCallback(async () => {
    console.log('account/onConnect -->', { account, handleConnect })

    if (!account && !handleConnect) {
      console.log('no account . . .')
      console.log('library/account/chainId -->', { library, account, chainId })
      activateBrowserWallet()
    }

    if (chainId !== requiredChain){
      await switchNetwork(requiredChain)
      return doAction()
    }
  }, [account, chainId])

  return (
    <BaseButton text={text} onPress={onPress} />
  );
}
