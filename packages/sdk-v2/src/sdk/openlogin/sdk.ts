import { BigNumberish, ethers } from "ethers";
import { Web3AuthCore } from "@web3auth/core";
import { OpenloginAdapter, OpenloginAdapterOptions } from "@web3auth/openlogin-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { WhiteLabelData } from "@toruslabs/openlogin-jrpc";
import TorusEmbed, { WhiteLabelParams } from "@toruslabs/torus-embed";
import { UserInfo, CHAIN_NAMESPACES, ADAPTER_STATUS, WALLET_ADAPTERS, SafeEventEmitterProvider, ADAPTER_EVENTS } from "@web3auth/base";
import EventEmitter from "eventemitter3";
import { cloneDeep } from 'lodash';
import { IOpenLoginCustomization, IOpenLoginOptions, IOpenLoginSDK, SDKEvent } from "./types";

import { translations } from "./i18n";

class OpenLoginWebSDK implements IOpenLoginSDK {
  private auth!: Web3AuthCore;  
  private eth!: ethers.providers.Web3Provider | null;  
  private adapter!: OpenloginAdapter;
  private plugin!: TorusWalletConnectorPlugin;
  private defaultAdapterOpts!: OpenloginAdapterOptions;
  private emitter = new EventEmitter();

  get initialized(): boolean {
    return !!this.auth;
  }

  get isLoggedIn(): boolean {
    return this.auth.status === ADAPTER_STATUS.CONNECTED && !!this.provider;
  }

  private get provider(): SafeEventEmitterProvider | null {
    return this.auth.provider;
  }

  private get wallet(): TorusEmbed | null {
    return this.plugin.torusWalletInstance;
  }

  async initialize({ 
    // login opts
    clientId, 
    googleClientId, 
    verifier, 
    network = 'testnet',     
    // customization opts
    ...customization
  }: IOpenLoginOptions): Promise<void> {
    if (this.initialized) {
      return;
    }

    const auth = new Web3AuthCore({      
      clientId,
      web3AuthNetwork: network,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xa4ec",
        rpcTarget: "https://rpc.ankr.com/celo", // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
    });   

    const whiteLabel = this.prepareWhitelabel(customization);

    const adapterOpts: OpenloginAdapterOptions = {
      adapterSettings: {
        uxMode: "popup",
        loginConfig: {
          jwt: {
            verifier,
            typeOfLogin: "jwt",
            clientId: googleClientId,
          },
        },
        whiteLabel: whiteLabel.adapter,
      },
    };

    const adapter = new OpenloginAdapter(adapterOpts);

    const plugin = new TorusWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {
        whiteLabel: whiteLabel.plugin,                
      },
    });
    
    auth.configureAdapter(adapter);
    await auth.addPlugin(plugin);
    await auth.init();

    this.auth = auth;
    this.adapter = adapter;
    this.plugin = plugin;  
    this.defaultAdapterOpts = adapterOpts;
    
    const { CONNECTED, DISCONNECTED } = ADAPTER_EVENTS;
    const eventListener = this.onLoginStateChanged.bind(this);

    for (const event of [CONNECTED, DISCONNECTED]) {
      auth.on(event, eventListener);
    }
  }

  customize(customization: IOpenLoginCustomization): void {
    const whiteLabel = this.prepareWhitelabel(customization);
    const adapterOpts: OpenloginAdapterOptions = cloneDeep(this.defaultAdapterOpts);
    const { adapterSettings } = adapterOpts;
    const { wallet } = this;

    if (adapterSettings) {
      adapterSettings.whiteLabel = whiteLabel.adapter;

      this.adapter.setAdapterSettings(adapterOpts);
    }
    
    if (wallet) {
      const { plugin: pluginCfg } = whiteLabel;
      const { defaultLanguage } = pluginCfg;
      
      wallet.whiteLabel = pluginCfg;

      if (defaultLanguage && (defaultLanguage in translations)) {
        const { embed } = translations[defaultLanguage as keyof typeof translations] || {};

        if (embed) {
          wallet.embedTranslations = embed;
        }
      }
    }
  }

  async login(): Promise<void> {
    this.assertInitialized();

    if (this.isLoggedIn) {
      return;
    }
    
    await this.auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });
  }

  async getUserInfo(): Promise<Partial<UserInfo>> {    
    this.assertInitialized();

    return this.auth.getUserInfo();
  }

  async logout(): Promise<void> {
    this.assertInitialized();

    if (!this.isLoggedIn) {
      return;
    }

    await this.auth.logout();
  }

  async getChainId(): Promise<any> {
    this.assertLogin();

    // Get the connected Chain's ID
    const networkDetails = await this.eth?.getNetwork();
    
    return networkDetails?.chainId;    
  }

  async getAccounts(): Promise<any> {
    this.assertLogin();

    const signer = this.eth?.getSigner();
    
    // Get user's Ethereum public address
    return signer?.getAddress();  
  }

  async getBalance(): Promise<string> {
    this.assertLogin();

    const { eth } = this    
    const signer = eth?.getSigner();    
    // Get user's Ethereum public address
    const address = await signer?.getAddress();
    // Balance is in wei
    const balance = await eth?.getBalance(<string>address);
    
    // Get user's balance in ether
    return ethers.utils.formatEther(<BigNumberish>balance);
  }

  async sendTransaction(destination: string, amount: number): Promise<any> {
    this.assertLogin();

    const signer = this.eth?.getSigner();
    const parsedAmount = ethers.utils.parseEther(String(amount));

    // Submit transaction to the blockchain
    const tx = await signer?.sendTransaction({
      to: destination,
      value: parsedAmount,
      maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
      maxFeePerGas: "6000000000000", // Max fee per gas
    });

    // Wait for transaction to be mined
    return tx?.wait();  
  }

  async signMessage(originalMessage: string): Promise<any> {
    this.assertLogin();

    const signer = this.eth?.getSigner();

    // Sign the message
    return signer?.signMessage(originalMessage);
  }

  async getPrivateKey(): Promise<any> {
    this.assertLogin();
    
    return this.provider?.request({
      method: "eth_private_key",
    })
  }

  addEventListener(event: SDKEvent, listener: (...args: any[]) => void): void {
    this.emitter.addListener(event, listener);
  }

  removeEventListener(event: SDKEvent, listener: (...args: any[]) => void): void {
    this.emitter.removeListener(event, listener);
  }

  private onLoginStateChanged() {
    const { isLoggedIn, provider } = this;
    let eth: ethers.providers.Web3Provider | null = null;
    
    if (provider) {
      eth = new ethers.providers.Web3Provider(provider);    
    }

    this.eth = eth;
    this.emitter.emit(SDKEvent.LoginStateChanged, isLoggedIn);    
  }

  private prepareWhitelabel({
    // app opts
    appName,
    appLogo,
    locale = "en",    
    // theme opts
    primaryColor,  
    darkMode = false
  }: IOpenLoginCustomization): { 
    adapter: WhiteLabelData; 
    plugin: WhiteLabelParams; 
  } {
    const colors = {
      primary: primaryColor || "#00a8ff",
    }

    const logo = {
      logoDark: appLogo || "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoLight: appLogo || "https://web3auth.io/images/w3a-D-Favicon-1.svg",
    }

    const adapter: WhiteLabelData = {
      name: appName,
      dark: darkMode,
      defaultLanguage: locale,          
      theme: colors,
      ...logo,
    }

    const plugin: WhiteLabelParams = {
      theme: { isDark: darkMode, colors },
      ...logo,
    };
    
    return { adapter, plugin };
  }

  private assertInitialized() {
    if (!this.auth) {
      throw new Error('Open login SDK not initialized');
    }
  }
  
  private assertLogin() {
    if (!this.provider) {
      throw new Error('User signed out');
    }
  }
}

export default OpenLoginWebSDK;
