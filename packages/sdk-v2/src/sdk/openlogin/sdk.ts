import { WhiteLabelData } from "@toruslabs/openlogin-jrpc";
import TorusEmbed, { WhiteLabelParams } from "@toruslabs/torus-embed";
import { ADAPTER_EVENTS, ADAPTER_STATUS, CHAIN_NAMESPACES, SafeEventEmitterProvider, UserInfo, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { ethers, BigNumberish } from "ethers";
import EventEmitter from "eventemitter3";
import { bindAll, pick, values } from 'lodash';
import { IOpenLoginCustomization, IOpenLoginOptions, IOpenLoginSDK, SDKEvent } from "./types";

const subscribeTo = values(pick(ADAPTER_EVENTS, 'CONNECTED', 'DISCONNECTED'));

class OpenLoginWebSDK implements IOpenLoginSDK {
  private auth!: Web3AuthCore | null;  
  private eth!: ethers.providers.Web3Provider | null;
  private adapter!: OpenloginAdapter | null;
  private plugin!: TorusWalletConnectorPlugin | null;
  private options!: IOpenLoginOptions;
  private emitter = new EventEmitter();

  get initialized(): boolean {
    return !!this.auth;
  }

  get isLoggedIn(): boolean {
    return this.auth?.status === ADAPTER_STATUS.CONNECTED && !!this.provider;
  }

  private get provider(): SafeEventEmitterProvider | null {
    return this.auth?.provider || null;
  }

  private get wallet(): TorusEmbed | null {
    return this.plugin?.torusWalletInstance || null;
  }

  constructor() {
    bindAll(this, 'onLoginStateChanged');
  }

  async initialize(options: IOpenLoginOptions): Promise<void> {  
    if (this.initialized) {
      return;
    }

    const { 
      // login opts
      clientId, 
      googleClientId, 
      verifier, 
      network = 'testnet',     
       // customization opts
       ...customization
    } = options;

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

    const adapter = new OpenloginAdapter({
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
    });

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
    this.options = options;
    
    for (const event of subscribeTo) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      auth.on(event, this.onLoginStateChanged);
    }       
  }

  async customize(customization: IOpenLoginCustomization): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { adapter, auth, options, onLoginStateChanged } = this;

    this.assertInitialized();
    await adapter?.openloginInstance?._cleanup();

    for (const event of subscribeTo) {      
      auth?.off(event, onLoginStateChanged);
    }

    this.auth = null;
    this.adapter = null;
    this.plugin = null; 
    
    await this.initialize({ ...options, ...customization });
  }

  async login(): Promise<void> {
    this.assertInitialized();

    if (this.isLoggedIn) {
      return;
    }
    
    await this.auth?.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });
  }

  async getUserInfo(): Promise<Partial<UserInfo>> {    
    this.assertInitialized();

    const userInfo = await this.auth?.getUserInfo();

    return userInfo || {};
  }

  async logout(): Promise<void> {
    this.assertInitialized();

    if (!this.isLoggedIn) {
      return;
    }

    await this.auth?.logout();    
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
    const { isLoggedIn, provider, wallet } = this;
    let eth: ethers.providers.Web3Provider | null = null;
      
    if (isLoggedIn && wallet?.torusWidgetVisibility) {
      wallet?.hideTorusButton();
    }
    
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
