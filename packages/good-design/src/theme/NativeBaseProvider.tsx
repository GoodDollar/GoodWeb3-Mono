import React, { ReactElement } from 'react';
import { Helmet } from "react-helmet";
import { NativeBaseProvider as BaseProvider, NativeBaseProviderProps } from 'native-base';

interface IExtraProps { 
  roboto?: boolean; 
  adobeCCKey?: string;
}

const ROBOTO_FAMILIES = "//fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
// TODO: add Graphie

export const NativeBaseProvider = ({ children, roboto = true, adobeCCKey, ...props }: NativeBaseProviderProps & IExtraProps): ReactElement => (
  <BaseProvider {...props}>
    <Helmet>
      {roboto && (
        <>
          <link rel="preconnect" href="//fonts.googleapis.com" />
          <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="crossorigin" />
          <link href={ROBOTO_FAMILIES} rel="stylesheet" />
        </>
      )}
      { //TODO:       <link href="//cc.adobe.com/.....?apiKey={adobeCCKey}" /> }
    </Helmet>
    {children}
  </BaseProvider>
);
