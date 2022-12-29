import { UserInfo } from "@web3auth/base";
import { useColorMode, useColorModeValue } from "native-base";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { IOpenLoginOptions, IOpenLoginSDK, IOpenLoginContext, IOpenLoginProviderProps, IOpenLoginHook, IEthersRPCHook, SDKEvent, IOpenLoginCustomization } from "./types";
import SDK from "./sdk";

export const OpenLoginContext = createContext<IOpenLoginContext>({
  userInfo: null,
  sdk: undefined,
})

export const OpenLoginProvider = ({ 
  // login opts
  clientId, 
  googleClientId, 
  verifier, 
  network = "testnet", 
  // app opts
  appName,
  appLogo,
  locale = "en",    
  // generic react props
  children 
}: IOpenLoginProviderProps) => {
  const { colorMode } = useColorMode();
  const primaryColor = useColorModeValue("primary.50", "primary.800");
  const [userInfo, setUserInfo] = useState<Partial<UserInfo> | null>(null);
  const [sdk, setSDK] = useState<IOpenLoginSDK>();
  const initiallyCustomizedRef = useRef<boolean>(false);

  const customization: IOpenLoginCustomization = {
    appName,
    appLogo,
    locale,
    primaryColor,
    darkMode: colorMode === "dark",
  };
  
  const optionsRef = useRef<IOpenLoginOptions>({ 
    clientId, 
    network, 
    googleClientId, 
    verifier,
    ...customization,
  });
  
  useEffect(() => {    
    const sdk = new SDK();
    const { LoginStateChanged } = SDKEvent;

    const onLoginStateChanged = async (isLoggedIn: boolean) => {
      let userInfo: Partial<UserInfo> | null = null;

      if (isLoggedIn) {
        userInfo = await sdk.getUserInfo();        
      }      

      setUserInfo(userInfo);
    }

    const initializeSDK = async () => {      
      try {
        await sdk.initialize(optionsRef.current);
        setSDK(sdk);
      } catch {
        // TODO: error handling
      }
    }
    
    sdk.addEventListener(LoginStateChanged, onLoginStateChanged);
    initializeSDK(); // eslint-disable-line @typescript-eslint/no-floating-promises

    return () => {
      sdk.removeEventListener(LoginStateChanged, onLoginStateChanged);
    }
  }, [setUserInfo, setSDK]);

  useEffect(() => {
    if (initiallyCustomizedRef.current) {
      // if flag enabled - update customization
      sdk?.customize(customization);
    } else if (sdk) {
      // once SDK initialized - enable flag to start updaing from the next render
      initiallyCustomizedRef.current = true;
    }
    
    // while sdk not initialized - do nothing
  }, [sdk, customization]);

  if (!sdk) {
    return null;
  }

  return (
    <OpenLoginContext.Provider value={{ userInfo, sdk }}>
      {children}
    </OpenLoginContext.Provider>
  );
}

export const useOpenLogin = (): IOpenLoginHook => {
  const { sdk, userInfo } = useContext(OpenLoginContext);
  const logout = useCallback(async () => sdk?.logout(), [sdk]);
  const login = useCallback(async () => sdk?.login(), [sdk]);
  const { isLoggedIn } = sdk ?? ({} as any);

  return { isLoggedIn, userInfo, login, logout };
}

export const useEthersRPC = (): IEthersRPCHook => {
  const { sdk } = useContext(OpenLoginContext);
  const getChainId = useCallback(async () => sdk?.getChainId(), [sdk]);
  const getAccounts = useCallback(async () => sdk?.getAccounts(), [sdk]);
  const getBalance = useCallback(async () => sdk?.getBalance() as Promise<string>, [sdk]);
  const getPrivateKey = useCallback(async () => sdk?.getPrivateKey(), [sdk]);
  
  const signMessage = useCallback(async (originalMessage: string) => {
    return sdk?.signMessage(originalMessage);
  }, [sdk]);

  const sendTransaction = useCallback(async (destination: string, amount: number) => {
    return sdk?.sendTransaction(destination, amount);
  }, [sdk]);

  return {
    getChainId,
    getAccounts,
    getBalance,
    getPrivateKey,
    signMessage,
    sendTransaction,
  };
}
