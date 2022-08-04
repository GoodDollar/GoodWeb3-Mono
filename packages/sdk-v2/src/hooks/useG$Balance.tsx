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
        method: 'getStaked',
        args: [account]
      }
    ]
  )

  if (results[0]?.error || results[1]?.error){
  }
  let depositBalance: string = '0', withdrawBalance: string = '0';
  if (!results.includes(undefined)) {
    const [balance] = results[0]?.value
    const [userStake] = results[1]?.value
    depositBalance = parseFloat( (parseInt(balance) / 1e2).toString() ).toFixed(2)
    withdrawBalance = parseFloat( (parseInt(userStake) / 1e6).toString() ).toFixed(2)
  }
  
  return { depositBalance: depositBalance, withdrawBalance: withdrawBalance }
}

// const { value: tokenBalance } = 
//   useCall(
//     account &&
//       g$ && {
//         contract: new Contract(g$, ERC20Interface),
//         method: 'balanceOf',
//         args: [account],
//       },
//     { refresh }
//   ) ?? {}