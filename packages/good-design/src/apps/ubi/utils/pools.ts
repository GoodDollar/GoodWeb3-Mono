import type { PoolDetails } from "@gooddollar/web3sdk-v2";

export const getUnclaimedPools = (pools: PoolDetails[]) =>
  pools?.filter(pool => {
    const claimsRemaining = Object.values(pool)[0];
    return claimsRemaining.some(details => !details.hasClaimed);
  });
