import { useMemo } from "react";

export const useRedirectUri = (redirectUrl: string | undefined) => {
  const redirectUri = useMemo(() => redirectUrl || document.location.href, [redirectUrl]);
  return redirectUri;
};
