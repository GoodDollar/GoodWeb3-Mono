import React from 'react'


import { QueryParams, useEthers, useCalls } from '@usedapp/core'
import { useGetContract } from '../sdk'
import { EnvKey } from '../sdk/base'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'

export function useG$Balance(refresh: QueryParams["refresh"] = "never", env?: EnvKey) {
  const { account } = useEthers()
  const gooddollar = useGetContract("GoodDollar", true, "savings", env) as IGoodDollar; 
  const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

  const results = useCalls(
    [
      {
        contract: gooddollar,
        method: 'balanceOf',
        args: [account]
      },
      {
        contract: gdStaking,
        method: 'getSavings',
        args: [account]
      }
    ]
  )

  if (results[0]?.error || results[1]?.error){
  }
  let g$Balance: string = '0', savingsBalance: string = '0';
  if (!results.includes(undefined)) {
    const [balance] = results[0]?.value
    const [sBalance] = results[1]?.value
    
    g$Balance = parseFloat( (parseInt(balance) / 1e2).toString() ).toFixed(2)
    savingsBalance = parseFloat( (parseInt(sBalance) / 1e2).toString()).toFixed(2)
  }
  
  return { g$Balance: g$Balance, savingsBalance: savingsBalance }
}