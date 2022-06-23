import React, { useEffect, useState } from "react";
import { parseLoginLink } from "./loginLinkUtils";

export interface LoginProps extends React.ComponentPropsWithoutRef<"button"> {
  /* Gooddollar link */
  gooddollarlink: string;
  /* Login callback function */
  onLoginCallback: (prop?: any) => void;
  /* Redirect URL */
  rdu?: string;
  /* Callback URL */
  cbu?: string;
}

export const useLogin = (props: LoginProps): (() => void) => {
  const { onLoginCallback, ...rest } = props;

  const onClick = () => {
    if (rest?.rdu && typeof rest?.rdu === "string") {
      window.location.href = rest?.gooddollarlink;
    } else if (rest?.cbu) {
      const openedWindow = window.open(
        rest?.gooddollarlink,
        "_blank",
        "width=400,height=500,left=100,top=200"
      );
      var loop = setInterval(function () {
        if (openedWindow?.closed) {
          clearInterval(loop);
          onLoginCallback();
        }
      }, 250);
    } else {
      throw new Error(
        "Please provide either a callback url or redirect URL to the component"
      );
    }
  };

  useEffect(() => {
    if (window.location.href.includes("?login=")) {
      const loginURI = window.location.href.split("=");
      onLoginCallback(parseLoginLink(loginURI[1]));
    }
  }, []);

  return onClick;
};
