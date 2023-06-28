export type WcConnectOptions = {
  customLabelFor: string;
  /**
   * Optional function to handle WalletConnect URI when it becomes available
   */
  handleUri?: (uri: string) => Promise<unknown>;
  connectFirstChainId?: boolean;
  bridge?: string;
  qrcodeModalOptions?: {
    mobileLinks: string[];
  };
} & {
  /**
   * Project ID associated with [WalletConnect account](https://cloud.walletconnect.com)
   */
  projectId: string;
  /**
   * Defaults to version: 1 - this behavior will be deprecated after the WalletConnect v1 sunset
   */
  version: 2;
  /**
   * List of Required Chain(s) ID for wallets to support in number format (integer or hex)
   * Defaults to [1] - Ethereum
   * The chains defined within the web3-onboard config will define the
   * optional chains for the WalletConnect module
   */
  requiredChains?: number[] | undefined;
};

export enum CustomLabels {
  zengo = "ZenGo",
  gooddollar = "GoodDollar Wallet",
  valora = "Valora"
}
