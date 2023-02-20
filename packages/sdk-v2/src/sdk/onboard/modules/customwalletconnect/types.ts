export type WcConnectOptions = {
  customLabelFor: string;
  bridge?: string;
  qrcodeModalOptions?: {
    desktopLinks: string[];
    mobileLinks: string[];
  };
  connectFirstChainId?: boolean;
} & {
  /**
   * Project ID associated with [WalletConnect account](https://cloud.walletconnect.com)
   */
  projectId: string;
  /**
   * Version 2 of wallet-connect
   */
  version: 2;
};

export enum CustomLabels {
  zengo = "ZenGo",
  gooddollar = "GoodDollar Wallet"
}
