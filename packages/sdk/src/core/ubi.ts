import Web3 from "web3";

import { ubiSchemeContract } from "contracts/UBISchemeContract";
import { getChainId } from "utils/web3";
import { debug } from "utils/debug";
import { NETWORK_LABELS, SupportedChainId } from "constants/chains";
import { InvalidChainId } from "utils/errors";
import { identityContract } from "contracts/IdentityContract";

/**
 * Get the whitelisted root address for an account.
 * This enables connected accounts to claim on behalf of their main whitelisted account.
 * 
 * Failure modes:
 * - Throws when no whitelisted root exists (returns 0x0)
 * - Throws on network/contract errors
 * 
 * @param {Web3} web3 Web3 instance.
 * @param {string} account Account address to check.
 * @returns {Promise<string>} The whitelisted root address.
 * @throws {Error} If account is not whitelisted or connected, or if resolution fails.
 */
export async function getWhitelistedRoot(web3: Web3, account: string): Promise<string> {
  try {
    const contract = await identityContract(web3);
    const root = await contract.methods.getWhitelistedRoot(account).call();

    // Explicitly handle 0x0 case - account is neither whitelisted nor connected
    if (!root || root === "0x0000000000000000000000000000000000000000") {
      throw new Error(
        "No whitelisted root address found; the account may not be whitelisted or connected."
      );
    }

    debug("Whitelisted root", root);
    return root;
  } catch (error) {
    // Normalize errors for predictable failure modes
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to resolve whitelisted root address: ${message}`);
  }
}

/**
 * Check wallet whitelisted.
 * @param {Web3} web3 Web3 instance.
 * @param {string} account Account address to check.
 * @returns {Promise<boolean>}
 */
export async function isWhitelisted(web3: Web3, account: string): Promise<boolean> {
  try {
    const root = await getWhitelistedRoot(web3, account);
    return root !== "0x0000000000000000000000000000000000000000";
  } catch {
    return false;
  }
}

/**
 * Check UBI token availability.
 * Uses the whitelisted root address for entitlement checks to support connected accounts.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Account address to check (can be connected account).
 * @returns {Promise<string>} Amount of UBI tokens.
 * @throws {Error} If account is not whitelisted or connected.
 */
export async function check(web3: Web3, address: string): Promise<string> {
  // Get the whitelisted root (throws if not whitelisted/connected)
  const whitelistedRoot = await getWhitelistedRoot(web3, address);

  const contract = await ubiSchemeContract(web3);
  // Use the whitelisted root for entitlement check, not the connected address
  const result = await contract.methods.checkEntitlement().call({ from: whitelistedRoot });
  debug("UBI", result.toString());

  return result.toString();
}

/**
 * Claim UBI token.
 * @param {Web3} web3 Web3 instance.
 */
export async function claim(web3: Web3, account: string): Promise<void> {
  await validateChainId(web3);

  const contract = await ubiSchemeContract(web3);
  return contract.methods.claim().send({ from: account, gasPrice: 11e9 });
}

/**
 * Validate that selected network is FUSE.
 * @param {Web3} web3 Web3 instance.
 */
async function validateChainId(web3: Web3): Promise<void> {
  const chainId = await getChainId(web3);

  if (chainId !== SupportedChainId.FUSE) {
    throw new InvalidChainId(NETWORK_LABELS[SupportedChainId.FUSE]);
  }
}
