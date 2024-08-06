import React, { useEffect } from "react";

export function tryJson<T = any>(source: string): T | null | string {
  if (source === null) {
    return null;
  }

  try {
    return JSON.parse(source);
  } catch {
    return source;
  }
}

export const decodeBase64Params = (value: string) => tryJson(atob(decodeURIComponent(value)));

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
      return;
    } else if (!rest?.cbu) {
      throw new Error("Please provide either a callback url or redirect URL to the component");
    }

    const openedWindow = window.open(rest?.gooddollarlink, "_blank", "width=400,height=500,left=100,top=200");

    const loop = setInterval(() => {
      if (openedWindow?.closed) {
        clearInterval(loop);
        onLoginCallback();
      }
    }, 250);
  };

  useEffect(() => {
    if (window.location.href.includes("?login=")) {
      const loginURI = window.location.href.split("=");

      onLoginCallback(decodeBase64Params(loginURI[1]));
    }
  }, []);

  return onClick;
};
