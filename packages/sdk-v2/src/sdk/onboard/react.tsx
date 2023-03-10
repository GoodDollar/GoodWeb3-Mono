import { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import { useRef } from "react";
import { customWcModule } from "./modules/customwalletconnect";
import { keys, pickBy } from "lodash";

export interface IOnboardWallets {
  gooddollar?: boolean;
  metamask?: boolean;
  walletconnect?: boolean;
  coinbase?: boolean;
  zengo?: boolean;
  custom?: InitOptions["wallets"];
}

export interface IOnboardProviderProps {
  options?: Omit<InitOptions, "wallets">;
  wallets?: IOnboardWallets | null;
  children?: React.ReactNode;
}

const injected = injectedModule({
  filter: {
    ["Binance Smart Wallet"]: false,
    ["MetaMask"]: true,
    ["Coinbase Wallet"]: true,
    ["detected"]: true,
    ["trust"]: false,
    ["opera"]: false,
    ["status"]: false,
    ["alphawallet"]: false,
    ["atoken"]: false,
    ["bitpie"]: false,
    ["blockwallet"]: false,
    ["Brave"]: false,
    ["dcent"]: false,
    ["frame"]: false,
    ["huobiwallet"]: false,
    ["hyperpay"]: false,
    ["imtoken"]: false,
    ["liquality"]: false,
    ["meetone"]: false,
    ["ownbit"]: false,
    ["mykey"]: false,
    ["tokenpocket"]: false,
    ["tp"]: false,
    ["xdefi"]: false,
    ["oneInch"]: false,
    ["tokenary"]: false,
    ["tally"]: false
  }
});

interface WcInitOptions {
  projectId: string;
  version: 2;
}
const wcInitOptions: WcInitOptions = {
  projectId: "095eb531a0c00781cb45644be58b065e",
  version: 2
};

const defaultWc = walletConnectModule({
  bridge: "https://bridge.walletconnect.org",
  qrcodeModalOptions: {
    mobileLinks: ["rainbow", "metamask", "argent", "trust", "imtoken", "pillar"]
  },
  connectFirstChainId: false,
  ...wcInitOptions
});

const coinbaseWalletSdk = coinbaseWalletModule();
const zenGoWc = customWcModule({
  customLabelFor: "zengo",
  bridge: "https://bridge.walletconnect.org",
  qrcodeModalOptions: {
    desktopLinks: ["zengo", "metamask"],
    mobileLinks: ["metamask", "zengo"] // TODO: has to be tested on IOS, android does not show list
  },
  connectFirstChainId: false,
  ...wcInitOptions
});

const gdWc = customWcModule({
  customLabelFor: "gooddollar",
  bridge: "https://bridge.walletconnect.org",
  connectFirstChainId: false,
  ...wcInitOptions
});

const defaultOptions: IOnboardProviderProps["options"] = {
  chains: [
    {
      id: "0xa4ec",
      token: "CELO",
      label: "CELO Testnet",
      rpcUrl: "https://alfajores-forno.celo-testnet.org",
      namespace: "evm"
    }
  ]
};

const defaultWalletsFlags: IOnboardWallets = {
  gooddollar: true,
  metamask: true,
  walletconnect: true,
  coinbase: true,
  zengo: true,
  custom: []
};

const walletsMap: Record<keyof Omit<IOnboardWallets, "custom">, any> = {
  gooddollar: gdWc,
  metamask: injected,
  walletconnect: defaultWc,
  coinbase: coinbaseWalletSdk,
  zengo: zenGoWc
};

export const OnboardProvider = ({
  options = defaultOptions,
  wallets = null,
  children
}: IOnboardProviderProps): JSX.Element => {
  const onboardRef = useRef<OnboardAPI>();

  // initialise once at first render
  (() => {
    if (onboardRef.current) {
      return;
    }

    const { custom = [], ...flags } = { ...defaultWalletsFlags, ...(wallets || {}) };
    const selectedWallets = keys(pickBy(flags));

    // TODO: add option to define order when custom wallets are added
    onboardRef.current = init({
      ...options,
      wallets: [...custom, ...selectedWallets.map(key => walletsMap[key])]
    });
  })();

  return <Web3OnboardProvider web3Onboard={onboardRef.current}>{children}</Web3OnboardProvider>;
};
