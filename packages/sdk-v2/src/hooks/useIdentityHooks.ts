import { IdentityV2 } from "@gooddollar/goodprotocol/types";
import usePromise from "react-use-promise";

import { useGetContract } from "../sdk";

export const useIdentityExpiryDate = (account: string) => {
  const identity = useGetContract("Identity", true, "claim", 42220) as IdentityV2;

  const result = usePromise(async () => {
    if (account && identity) {
      const lastAuthenticated = await identity.lastAuthenticated(account);
      const authPeriod = await identity.authenticationPeriod();
      const periodInMs = authPeriod.mul(24 * 60 * 60 * 1000);
      const expiryTimestamp = lastAuthenticated.mul(1000).add(periodInMs);

      return { expiryTimestamp, authPeriod };
    }

    return Promise.resolve(undefined);
  }, [account, identity]);

  return result;
};