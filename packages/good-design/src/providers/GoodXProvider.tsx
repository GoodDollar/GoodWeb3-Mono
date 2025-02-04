import React, { FC, PropsWithChildren } from "react";
import { GoodIdContextProvider } from "@gooddollar/web3sdk-v2";
import { NativeBaseProviderProps } from "native-base";

import { GoodIdProvider } from "../apps";
import { GoodUIi18nProvider, NativeBaseProvider } from "../theme";
import { RedirectNoticeProvider } from "../hooks";

const GoodXProvider: FC<PropsWithChildren<{ nativeBaseProps: NativeBaseProviderProps }>> = ({
  nativeBaseProps,
  children
}) => (
  <GoodIdContextProvider>
    <GoodIdProvider>
      <GoodUIi18nProvider>
        <NativeBaseProvider {...nativeBaseProps}>
          <RedirectNoticeProvider>{children}</RedirectNoticeProvider>
        </NativeBaseProvider>
      </GoodUIi18nProvider>
    </GoodIdProvider>
  </GoodIdContextProvider>
);

export default GoodXProvider;
