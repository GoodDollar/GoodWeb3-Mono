import { ethers } from "ethers";

// GoodDollar Bridge API functions
export const fetchBridgeFees = async () => {
  try {
    const response = await fetch("https://goodserver.gooddollar.org/bridge/estimatefees");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching bridge fees:", error);
    return null;
  }
};

export const convertFeeToWei = (fee: string, currency: string): string => {
  const feeValue = parseFloat(fee);

  console.log(`Converting ${feeValue} ${currency} to wei`);
  return ethers.utils.parseEther(feeValue.toString()).toString();
};

export const convertFeeFromWei = (weiAmount: string): string => {
  return ethers.utils.formatUnits(weiAmount, 18);
};

// Explorer link functions
export const getLayerZeroExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://layerzeroscan.com/${chainName}/tx/${txHash}`;
};

export const getAxelarExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://axelarscan.io/${chainName}/tx/${txHash}`;
};
