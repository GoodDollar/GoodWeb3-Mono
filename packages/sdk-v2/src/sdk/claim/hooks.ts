import { IIdentity, UBIScheme } from "@gooddollar/goodprotocol/types";
import { ChainId, QueryParams, useCalls } from "@usedapp/core";
import { BigNumber } from "ethers";
import { first } from "lodash";
import { isNonZeroAddress } from "../utils/address";

/**
 * Resolved whitelisted root for an account.
 * @param identity - Identity contract instance
 * @param account - Account address to check
 * @param refresh - Refresh frequency
 * @param chainId - Chain ID
 * @returns The whitelisted root address if found, otherwise undefined
 */
export const useWhitelistedRoot = (
  identity: IIdentity | undefined,
  account: string | undefined,
  refresh: QueryParams["refresh"],
  chainId: ChainId
): string | undefined => {
  const [result] = useCalls(
    [
      identity &&
        account && {
          contract: identity,
          method: "getWhitelistedRoot",
          args: [account]
        }
    ],
    { refresh, chainId }
  );

  const root = first(result?.value) as string | undefined;
  return isNonZeroAddress(root) ? root : undefined;
};

/**
 * Resolve entitlement for a whitelisted root address.
 * @param ubi - UBIScheme contract instance
 * @param root - The whitelisted root address
 * @param refresh - Refresh frequency
 * @param chainId - Chain ID
 * @returns The entitlement amount as BigNumber, otherwise undefined
 */
export const useEntitlementForRoot = (
  ubi: UBIScheme | undefined,
  root: string | undefined,
  refresh: QueryParams["refresh"],
  chainId: ChainId
): BigNumber | undefined => {
  const [result] = useCalls(
    [
      ubi &&
        isNonZeroAddress(root) && {
          contract: ubi,
          method: "checkEntitlement(address)",
          args: [root]
        }
    ],
    { refresh, chainId }
  );

  return first(result?.value) as BigNumber | undefined;
};
