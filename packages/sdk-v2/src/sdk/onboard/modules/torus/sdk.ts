import type { WalletInit } from '@web3-onboard/common'
import type { TorusCtorArgs, TorusParams } from '@toruslabs/torus-embed'

type TorusOptions = TorusCtorArgs & TorusParams

const TorusIcon = `
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/>
  </svg>
`

function torus(options?: TorusOptions): WalletInit {
    const {
        buttonPosition,
        modalZIndex,
        apiKey,
        buildEnv,
        enableLogging,
        loginConfig,
        showTorusButton,
        integrity,
        whiteLabel,
        skipTKey,
    } = options || {}

    return () => {
        return {
            label: 'Google (Powered by Web3Auth)',
            getIcon: async () => TorusIcon,
            getInterface: async ({ chains }) => {
                const { default: Torus } = await import('@toruslabs/torus-embed')

                const { createEIP1193Provider, ProviderRpcErrorCode, ProviderRpcError } = await import(
                    '@web3-onboard/common'
                )

                const [chain] = chains

                const instance = new Torus({
                    buttonPosition,
                    modalZIndex,
                    apiKey,
                })

                await instance.init({
                    buildEnv,
                    enableLogging,
                    network: {
                        host: chain.rpcUrl,
                        chainId: parseInt(chain.id),
                        networkName: chain.label,
                    },
                    showTorusButton: showTorusButton,
                    loginConfig,
                    integrity,
                    whiteLabel,
                    skipTKey,
                })

                const torusProvider = instance.provider

                // patch the chainChanged event
                const on = torusProvider.on.bind(torusProvider)
                torusProvider.on = (event, listener) => {
                    on(event, (val) => {
                        if (event === 'chainChanged') {
                            console.log('chainChanged -- torus')
                            listener(`0x${(val as number).toString(16)}`)
                            return
                        }

                        listener(val)
                    })

                    return torusProvider
                }

                const provider = createEIP1193Provider(torusProvider, {
                    eth_requestAccounts: async () => {
                        try {
                            const accounts = await instance.login()
                            return accounts
                        } catch (error) {
                            throw new ProviderRpcError({
                                code: ProviderRpcErrorCode.ACCOUNT_ACCESS_REJECTED,
                                message: 'Account access rejected',
                            })
                        }
                    },
                    eth_selectAccounts: null,
                    wallet_switchEthereumChain: async ({ params }) => {
                        const chain = chains.find(({ id }) => id === params[0].chainId)
                        if (!chain) throw new Error('chain must be set before switching')

                        await instance.setProvider({
                            host: chain.rpcUrl,
                            chainId: parseInt(chain.id),
                            networkName: chain.label,
                        })

                        return null
                    },
                    eth_chainId: async ({ baseRequest }) => {
                        const chainId = await baseRequest({ method: 'eth_chainId' })
                        return `0x${parseInt(chainId).toString(16)}`
                    },
                })

                provider.disconnect = () => instance.cleanUp()

                return {
                    provider,
                    instance,
                }
            },
        }
    }
}

export default torus
