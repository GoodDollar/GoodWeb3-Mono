import React, { ReactElement } from "react";
import { useLogin } from "./loginHook";
import { LoginProps } from "./loginHook";

export const LoginButton = (props: LoginProps): ReactElement => {
  const { onLoginCallback, ...rest } = props;
  const onButtonClick = useLogin({
    rdu: rest.rdu,
    cbu: rest.cbu,
    gooddollarlink: rest.gooddollarlink,
    onLoginCallback: onLoginCallback,
  });

  return <button {...rest} onClick={onButtonClick} />;
};
