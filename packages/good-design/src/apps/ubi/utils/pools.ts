import type { PoolDetails } from "@gooddollar/web3sdk-v2";

export const getUnclaimedPools = (pools: PoolDetails[] | undefined) =>
  pools?.filter(pool => {
    const claimsRemaining = Object.values(pool)[0];
    //todo: remove this hardcoded address
    if (claimsRemaining.address === "0xA6D77Aa130E729886C90A48e0eE539d6C6795dF7") {
      return false;
    }
    return !claimsRemaining.hasClaimed;
  });
