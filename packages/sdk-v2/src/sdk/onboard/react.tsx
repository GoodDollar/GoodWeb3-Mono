import React from "react";
import { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import { useRef } from "react";
import { customwc, icons } from "./modules/customwalletconnect";
import { keys, pickBy } from "lodash";
import { getDevice, isMobile } from "../base";

export interface IOnboardWallets {
  valora?: boolean;
  gd?: boolean;
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

const wc1InitOptions = {
  version: 1,
  projectId: "095eb531a0c00781cb45644be58b065e",
  bridge: "https://bridge.walletconnect.org",
  qrcodeModalOptions: {
    mobileLinks: ["valora", "fuse.cash", "zengo", "metamask", "coinbasewallet", "safe"] // TODO: has to be tested on IOS, android does not show list
  },
  connectFirstChainId: false,
  handleUri: undefined
};

export const wc2InitOptions = {
  projectId: "095eb531a0c00781cb45644be58b065e",
  version: 2,
  requiredChains: [42220, 122, 1],
  qrModalOptions: {
    themeVariables: [],
    chainImages: [],
    enableExplorer: true,
    explorerAllowList: [],
    explorerDenyList: [],
    privacyPolicyUrl: {} as any,
    tokenImages: [],
    termsOfServiceUrl: "",
    themeMode: "light",
    walletImages: {
      valora: icons["valora"].webp,
      zengo: icons["zengo"].webp,
      gooddollar: icons["gooddollar"].webp,
      celosafe: icons["celosafe"].webp,
      safe: icons["safe"].webp,
      fusesafe: icons["fusesafe"].webp,
      metamask: icons["metamask"].webp
    },
    desktopWallets: [
      {
        id: "gooddollar",
        name: "GoodDollar",
        links: {
          universal: "https://wallet.gooddollar.org"
        }
      },
      {
        id: "celosafe",
        name: "CeloSafe",
        links: {
          universal: "https://safe.celo.org"
        }
      },
      {
        id: "fusesafe",
        name: "FuseSafe",
        links: {
          universal: "https://safe.fuse.io"
        }
      },
      {
        id: "safe",
        name: "Safe",
        links: {
          universal: "https://app.safe.global"
        }
      }
    ],
    mobileWallets: [
      {
        id: "gooddollar",
        name: "GoodDollar",
        links: {
          universal: "https://wallet.gooddollar.org",
          native: "gooddollar://"
        }
      },
      {
        id: "valora",
        name: "Valora",
        links: {
          universal: "https://valoraapp.com", // likely should be based on OS
          native: "celo://wallet"
        }
      },
      {
        id: "zengo",
        name: "Zengo",
        links: {
          universal: "https://get.zengo.com"
        }
      },
      {
        id: "metamask",
        name: "Metamask",
        links: {
          native: "metamask:",
          universal: "https://metamask.app.link"
        }
      }
    ]
  }
};

const defaultWc = walletConnectModule({
  ...(wc1InitOptions as any)
});

const coinbaseWalletSdk = coinbaseWalletModule();

const zengo = customwc({
  label: "zengo",
  ...(wc1InitOptions as any),
  handleUri: uri =>
    new Promise(res => {
      isMobile() && window.open(`https://get.zengo.com/wc?uri=${encodeURIComponent(uri)}`, "_blank");
      res(true);
    })
});

const valora = customwc({
  label: "valora",
  ...(wc2InitOptions as any),
  handleUri: async uri => {
    switch (getDevice().os.name) {
      case "Android":
        window.open(`celo://wallet/wc?uri=${encodeURIComponent(uri)}`, "_blank");
        break;
      case "iOS":
        // from workaround fix found in rainbowkit: https://github.com/rainbow-me/rainbowkit/blob/42472774f79309ccd114fe26bf1418d057865a1f/packages/rainbowkit/src/components/ConnectOptions/MobileOptions.tsx#LL72C13-L89C14
        // ios wallet-connect reference: https://docs.walletconnect.com/2.0/ios/guides/mobile-linking#ios-app-link-constraints
        {
          const mobileUri = `https://valoraapp.com/wc?uri=${encodeURIComponent(uri)}`;
          if (mobileUri.startsWith("http")) {
            // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
            // Using 'window.open' causes issues on iOS in non-Safari browsers and
            // WebViews where a blank tab is left behind after connecting.
            // This is especially bad in some WebView scenarios (e.g. following a
            // link from Twitter) where the user doesn't have any mechanism for
            // closing the blank tab.
            // For whatever reason, links with a target of "_blank" don't suffer
            // from this problem, and programmatically clicking a detached link
            // element with the same attributes also avoids the issue.
            const el = document.createElement("a");
            el.href = mobileUri;
            el.target = "_blank";
            el.rel = "noreferrer noopener";
            el.click();
          } else {
            window.location.href = mobileUri;
          }
        }
        break;
    }
    return true;
  }
});

const gd = customwc({
  label: "gooddollar",
  ...(wc2InitOptions as any),
  handleUri: async uri => {
    switch (getDevice().os.name) {
      case "Android":
        window.open(`gooddollar://wc?uri=${encodeURIComponent(uri)}`, "_blank");
        break;
      default:
        window.open(`http://dev.gooddollar.org/wc?uri=${encodeURIComponent(uri)}`, "_blank");
    }
    return true;
  }
});

const defaultOptions: IOnboardProviderProps["options"] = {
  chains: [
    {
      id: 42220,
      namespace: "evm"
    },
    {
      id: 122,
      namespace: "evm",
      rpcUrl: "https://rpc.fuse.io"
    },
    {
      id: 1,
      namespace: "evm"
    }
  ]
};

const defaultWalletsFlags: IOnboardWallets = {
  gd: true,
  walletconnect: true,
  valora: true,
  metamask: true,
  coinbase: true,
  zengo: true,
  custom: []
};

const walletsMap: Record<keyof Omit<IOnboardWallets, "custom">, any> = {
  gd,
  walletconnect: defaultWc,
  valora,
  metamask: injected,
  coinbase: coinbaseWalletSdk,
  zengo
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
