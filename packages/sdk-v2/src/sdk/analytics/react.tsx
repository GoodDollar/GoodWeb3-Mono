import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { assign, noop } from "lodash";

import { Analytics, IAnalyticsConfig } from "./sdk";
import { IAbstractProvider, IAnalyticsProvider, IAppProps, IMonitoringProvider, IProvider } from "./types";

export interface IAnalyticsContext
  extends Pick<IAbstractProvider, "identify">,
    IAnalyticsProvider,
    IMonitoringProvider {
  productEnv: string;
}

export interface IAnaliticsProviderProps {
  config: IAnalyticsConfig;
  appProps: IAppProps;
  productEnv: "gw" | "ngw" | "dapp" | string;
  children?: any;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

export const AnalyticsContext = createContext<IAnalyticsContext>({
  identify: (identifier: string | number, email?: string, props?: object): void => {},
  send: (event: string, data?: object): void => {},
  capture: (exception: Error, fingerprint?: string[], tags?: object, extra?: object): void => {},
  productEnv: ""
});

/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

export const AnalyticsProvider: FC<IAnaliticsProviderProps> = ({ config, appProps, productEnv, children }) => {
  const [sdk, setSDK] = useState<IProvider | null>(null);
  const configRef = useRef(config);
  const appPropsRef = useRef(appProps);

  const send = useCallback(
    (event: string, data?: object): void => {
      sdk?.send?.(event, data);
    },
    [sdk]
  );

  const capture = useCallback(
    (exception: Error, fingerprint?: string[], tags?: object, extra?: object): void => {
      sdk?.capture?.(exception, fingerprint, tags, extra);
    },
    [sdk]
  );

  const identify = useCallback(
    (identifier: string | number, email?: string, props?: object): void => {
      sdk?.identify?.(identifier, email, props);
    },
    [sdk]
  );

  useEffect(() => {
    const sdk = new Analytics(configRef.current);

    sdk
      .initialize(appPropsRef.current)
      .then(() => setSDK(sdk))
      .catch(noop);
  }, [setSDK]);

  return !sdk ? null : (
    <AnalyticsContext.Provider value={{ send, capture, identify, productEnv }}>{children}</AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): IAnalyticsContext => useContext(AnalyticsContext);

export interface IAnalyticsData {
  action: string;
  [key: string]: string | number | [string | undefined, string | undefined] | undefined;
}

export const useSendAnalytics = (): { track: IAnalyticsContext["send"] } => {
  const { productEnv, send } = useAnalytics(); // eslint-disable-line @typescript-eslint/unbound-method

  const onSend = useCallback(
    (event: string, data?: IAnalyticsData) => {
      assign(data, { product: productEnv });
      send(event, data);
    },
    [send]
  );

  return { track: onSend };
};
