import React from "react";
import { InitOptions } from "@web3-onboard/core";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import { WalletConnectOptions } from "@web3-onboard/walletconnect/dist/types";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import { customwc, icons } from "./modules/customwalletconnect";
import { defaultsDeep, keys, pickBy } from "lodash";
import { getDevice, isMobile } from "../base/utils";
import { Envs } from "../constants";
import { InjectedNameSpace } from "@web3-onboard/injected-wallets/dist/types";

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
  wc2Options?: WalletConnectOptions | object;
  gdEnv?: string;
  children?: React.ReactNode;
}

const currentDevice = getDevice().os.name;

const injected = injectedModule({
  filter: {
    ["detected"]: true
  },
  custom: [
    {
      checkProviderIdentity: ({ provider }) => !!provider && !!provider["isMiniPay"],
      label: "Mini Pay",
      injectedNamespace: InjectedNameSpace.Ethereum,
      platforms: ["mobile"],
      // A method that returns a string of the wallet icon which will be displayed
      getIcon: async () => (await import("@web3-onboard/injected-wallets/dist/icons/opera")).default,
      // Returns a valid EIP1193 provider. In some cases the provider will need to be patched to satisfy the EIP1193 Provider interface
      getInterface: () =>
        Promise.resolve({
          provider: window["ethereum"]
        })
    }
  ]
});

export const wc2InitOptions = {
  projectId: "095eb531a0c00781cb45644be58b065e",
  version: 2,
  qrModalOptions: {
    optionalChains: [122, 1, 42220],
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
          universal: "https://valoraapp.com/",
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
  valora: currentDevice === "Android" ? true : false,
  metamask: true,
  coinbase: true,
  zengo: true,
  custom: []
};

const getWallets = (wc2Options: WalletConnectOptions | object, gdEnv = "development-celo") => {
  const mergedOptions = defaultsDeep({}, wc2Options, wc2InitOptions);
  const defaultWc = walletConnectModule({
    ...(mergedOptions as any)
  });
  const coinbaseWalletSdk = coinbaseWalletModule();

  const zengo = customwc({
    label: "zengo",
    ...(mergedOptions as any),
    handleUri: uri =>
      new Promise(res => {
        isMobile() && window.open(`https://get.zengo.com/wc?uri=${encodeURIComponent(uri)}`, "_blank");
        res(true);
      })
  });

  // ios might be enabled later when proper support for v2 and fix for handling uri
  const valora = customwc({
    label: "valora",
    ...(mergedOptions as any),
    handleUri: async uri => {
      switch (getDevice().os.name) {
        case "Android":
          window.open(`celo://wallet/wc?uri=${encodeURIComponent(uri)}`, "_blank");
          break;
        // case "iOS":
        //   window.open(`https://valoraapp.com/wc?uri=${encodeURIComponent(uri)}`, "_blank");
        //   break;
      }
      return true;
    }
  });

  const getWalletUrl = (gdEnv: string) => {
    let walletUrl = Envs.development.dappUrl;
    switch (true) {
      case gdEnv.includes("production"):
        walletUrl = Envs.production.dappUrl;
        break;
      case gdEnv.includes("staging"):
        walletUrl = Envs.staging.dappUrl;
        break;
    }
    return `${walletUrl}/wc?uri=`;
  };

  const gd = customwc({
    label: "gooddollar",
    ...(mergedOptions as any),
    handleUri: async uri => {
      switch (getDevice().os.name) {
        case "Android":
          window.open(`gooddollar://wc?uri=${encodeURIComponent(uri)}`, "_blank");
          break;
        default:
          window.open(`${getWalletUrl(gdEnv)}${encodeURIComponent(uri)}`, "_blank");
      }
      return true;
    }
  });

  const walletsMap: Record<keyof Omit<IOnboardWallets, "custom">, any> = {
    gd,
    walletconnect: defaultWc,
    valora,
    metamask: injected,
    coinbase: coinbaseWalletSdk,
    zengo
  };
  return walletsMap;
};

export const OnboardProvider = React.memo(
  ({
    options = defaultOptions,
    wallets = null,
    wc2Options = {},
    gdEnv,
    children
  }: IOnboardProviderProps): JSX.Element => {
    let onboard;
    // initialise once at first render
    (() => {
      const walletsMap = getWallets(wc2Options, gdEnv);
      const { custom = [], ...flags } = { ...defaultWalletsFlags, ...(wallets || {}) };
      const selectedWallets = keys(pickBy(flags));

      // TODO: add option to define order when custom wallets are added
      onboard = init({
        ...options,
        wallets: [...custom, ...selectedWallets.map(key => walletsMap[key])]
      });
    })();

    return <Web3OnboardProvider web3Onboard={onboard}>{children}</Web3OnboardProvider>;
  }
);
