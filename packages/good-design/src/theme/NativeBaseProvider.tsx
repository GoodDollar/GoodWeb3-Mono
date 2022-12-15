import React, { ReactElement } from 'react';
import { Helmet } from "react-helmet";
import { NativeBaseProvider as BaseProvider, NativeBaseProviderProps } from 'native-base';

const ROBOTO_FAMILIES = "//fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
// TODO: add Graphie

export const NativeBaseProvider = ({ children, ...props }: NativeBaseProviderProps): ReactElement => (
  <BaseProvider {...props}>
    <Helmet>
      <link rel="preconnect" href="//fonts.googleapis.com" />
      <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="crossOrigin" />
      <link href={ROBOTO_FAMILIES} rel="stylesheet" />
    </Helmet>
    {children}
  </BaseProvider>
);
