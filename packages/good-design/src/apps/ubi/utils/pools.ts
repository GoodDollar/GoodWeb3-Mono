import type { PoolDetails } from "@gooddollar/web3sdk-v2";

export const getUnclaimedPools = (pools: PoolDetails[] | undefined) => pools?.filter(pool => !pool.hasClaimed);
