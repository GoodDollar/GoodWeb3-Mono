import { useMemo } from "react";

export const useRedirectUri = (redirectUrl: string) => {
  const redirectUri = useMemo(() => redirectUrl || document.location.href, [redirectUrl]);
  return redirectUri;
};
