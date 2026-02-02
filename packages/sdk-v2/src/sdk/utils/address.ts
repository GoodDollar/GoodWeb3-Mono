export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Check if an address is the zero address.
 * @param address - The address to check
 * @returns true if the address is null, undefined, or the zero address
 */
export const isZeroAddress = (address: string | null | undefined): boolean => {
  return !address || address.toLowerCase() === ZERO_ADDRESS;
};

/**
 * Check if the provided address is a valid whitelisted root (non-zero).
 * @param address - The address to check
 * @returns true if the address is not the zero address
 */
export const isValidWhitelistedRoot = (address: string | null | undefined): boolean => {
  return !isZeroAddress(address);
};
