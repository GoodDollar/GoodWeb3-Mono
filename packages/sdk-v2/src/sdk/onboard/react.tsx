import { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { init, Web3OnboardProvider } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import { useRef } from "react";
import { torus as torusModule } from './modules/torus'
import { customWcModule } from "./modules/customwalletconnect";

export interface IOnboardProviderProps {
  options?: Omit<InitOptions, "wallets">;
  children?: React.ReactNode;
}

const injected = injectedModule({
  filter: {
      ['Binance Smart Wallet']: false,
      ['MetaMask']: true,
      ['Coinbase Wallet']: true,
      ['detected']: true,
      ['trust']: false,
      ['opera']: false,
      ['status']: false,
      ['alphawallet']: false,
      ['atoken']: false,
      ['bitpie']: false,
      ['blockwallet']: false,
      ['Brave']: false,
      ['dcent']: false,
      ['frame']: false,
      ['huobiwallet']: false,
      ['hyperpay']: false,
      ['imtoken']: false,
      ['liquality']: false,
      ['meetone']: false,
      ['ownbit']: false,
      ['mykey']: false,
      ['tokenpocket']: false,
      ['tp']: false,
      ['xdefi']: false,
      ['oneInch']: false,
      ['tokenary']: false,
      ['tally']: false,
  },
})

const defaultWc = walletConnectModule({
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModalOptions: {
      mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar'],
  },
})

const coinbaseWalletSdk = coinbaseWalletModule()
const zenGoWc = customWcModule({
  customLabelFor: 'zengo',
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModalOptions: {
      desktopLinks: ['zengo', 'metamask'],
      mobileLinks: ['metamask', 'zengo'], // TODO: has to be tested on IOS, android does not show list
  },
})

const gdWc = customWcModule({
  customLabelFor: 'gooddollar',
  bridge: 'https://bridge.walletconnect.org',
})

const torus = torusModule({
  buildEnv: 'testing',
})

const defaultOptions: IOnboardProviderProps["options"] = {
  chains: [{
    id: "0xa4ec",
    token: 'CELO',
    label: 'CELO Testnet',
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    namespace: "evm",
  }]
}

export const OnboardProvider = ({ options = defaultOptions, children }: IOnboardProviderProps): JSX.Element => {
  const onboardRef = useRef<OnboardAPI>();

  // initialise once at first render
  ;(() => {
    if (onboardRef.current) {
      return;
    }

    onboardRef.current = init({
      wallets: [
        torus,
        gdWc,
        injected,
        defaultWc,
        coinbaseWalletSdk,
        zenGoWc
      ],
      ...options,
    })
  })();

  return <Web3OnboardProvider web3Onboard={onboardRef.current}>{children}</Web3OnboardProvider>;
}