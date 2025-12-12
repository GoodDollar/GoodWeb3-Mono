import {
  ChainNotConfiguredError,
  type Connector,
  createConnector,
} from '@wagmi/core'
import { fromHex, getAddress, numberToHex, SwitchChainError } from 'viem'

interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void
  on(event: 'chainChanged', handler: (chainId: string) => void): void
  on(event: 'disconnect', handler: (error?: Error) => void): void
  removeListener(event: 'accountsChanged', handler: (accounts: string[]) => void): void
  removeListener(event: 'chainChanged', handler: (chainId: string) => void): void
  removeListener(event: 'disconnect', handler: (error?: Error) => void): void
}

interface MiniPayProvider extends EIP1193Provider {
  isMiniPay: boolean
}

interface WindowWithEthereum extends Window {
  ethereum?: MiniPayProvider
}

function getMiniPayProvider(): MiniPayProvider | undefined {
  if (typeof window === 'undefined') return undefined
  const ethereum = (window as WindowWithEthereum).ethereum
  if (ethereum?.isMiniPay) return ethereum
  return undefined
}

minipay.type = 'minipay'

let accountsChanged: ((accounts: string[]) => void) | undefined
let chainChanged: ((chainId: string) => void) | undefined
let disconnect: ((error?: Error) => void) | undefined

export function minipay(): ReturnType<typeof createConnector<MiniPayProvider>> {
  return createConnector<MiniPayProvider>((config) => ({
    id: 'minipay',
    name: 'MiniPay',
    rdns: 'com.opera.minipay',
    icon: 'https://cdn.prod.website-files.com/67a18fbe6a1b30b8c753f370/67a1bd5d25d5c9f3dfa5545a_Favicon.png',
    type: minipay.type,

    async connect({ chainId } = {}) {
      const provider = (await this.getProvider()) as MiniPayProvider

      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[]

      let targetChainId = chainId
      if (!targetChainId) {
        const state = (await config.storage?.getItem('state')) ?? {}
        const isChainSupported = config.chains.some(
          (x) => x.id === state.chainId,
        )
        if (isChainSupported) targetChainId = state.chainId
        else targetChainId = config.chains[0]?.id
      }
      if (!targetChainId) throw new Error('No chains found on connector.')

      if (!accountsChanged) {
        accountsChanged = this.onAccountsChanged.bind(this)
        provider.on('accountsChanged', accountsChanged as (accounts: string[]) => void)
      }
      if (!chainChanged) {
        chainChanged = this.onChainChanged.bind(this)
        provider.on('chainChanged', chainChanged as (chainId: string) => void)
      }
      if (!disconnect) {
        disconnect = this.onDisconnect.bind(this)
        provider.on('disconnect', disconnect as (error?: Error) => void)
      }

      let currentChainId = await this.getChainId()
      if (targetChainId && currentChainId !== targetChainId) {
        const chain = await this.switchChain!({ chainId: targetChainId })
        currentChainId = chain.id
      }

      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId,
      } as any
    },

    async disconnect() {
      const provider = (await this.getProvider()) as MiniPayProvider

      if (accountsChanged) {
        provider.removeListener('accountsChanged', accountsChanged as (accounts: string[]) => void)
        accountsChanged = undefined
      }

      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged as (chainId: string) => void)
        chainChanged = undefined
      }

      if (disconnect) {
        provider.removeListener('disconnect', disconnect as (error?: Error) => void)
        disconnect = undefined
      }
    },

    async getAccounts() {
      const provider = (await this.getProvider()) as MiniPayProvider
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[]
      return accounts.map((x) => getAddress(x))
    },

    async getChainId() {
      const provider = (await this.getProvider()) as MiniPayProvider
      const hexChainId = (await provider.request({ method: 'eth_chainId' })) as `0x${string}`
      return fromHex(hexChainId, 'number')
    },

    async isAuthorized() {
      try {
        const accounts = await this.getAccounts()
        return !!accounts.length
      } catch {
        return false
      }
    },

    async switchChain({ chainId }) {
      const provider = (await this.getProvider()) as MiniPayProvider

      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) {
        throw new SwitchChainError(new ChainNotConfiguredError())
      }

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(chainId) }],
      })

      config.emitter.emit('change', { chainId })

      return chain
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect()
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        })
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain)
      config.emitter.emit('change', { chainId })
    },

    async onDisconnect() {
      config.emitter.emit('disconnect')
    },

    async getProvider() {
      const provider = getMiniPayProvider()
      if (!provider) {
        throw new Error('MiniPay not detected. Please install MiniPay wallet.')
      }
      return provider
    },
  }))
}

