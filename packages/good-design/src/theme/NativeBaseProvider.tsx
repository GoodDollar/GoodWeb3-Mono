import React, { ReactElement } from 'react';
import { Helmet } from "react-helmet";
import { NativeBaseProvider as BaseProvider, NativeBaseProviderProps } from 'native-base';

interface IExtraProps {
  roboto?: boolean;
  montserrat?: boolean;
}

const ROBOTO_FAMILIES = "//fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
const MONTSERRAT_FAMILIES = "//fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"

export const NativeBaseProvider = ({ children, roboto = true, montserrat = true, ...props }: NativeBaseProviderProps & IExtraProps): ReactElement => {
  const withGoogleFonts = roboto || montserrat

  return <BaseProvider {...props}>
    <Helmet>
      {withGoogleFonts && (
        <>
          <link rel="preconnect" href="//fonts.googleapis.com"/>
          <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="crossorigin"/>
        </>
      )}
      {roboto && <link href={ROBOTO_FAMILIES} rel="stylesheet"/>}
      {montserrat && <link href={MONTSERRAT_FAMILIES} rel="stylesheet"/>}
    </Helmet>
    {children}
  </BaseProvider>
};
