import { useMemo } from "react";

export const useQueryParam = (param: string): string | null => {
  const { search, hash } = window.location;

  return useMemo(() => {
    // in case of hash we have empty search field
    const queryString = search || hash?.split("?")[1];
    const params = new URLSearchParams(queryString);

    return params.get(param);
  }, [param]);
};
