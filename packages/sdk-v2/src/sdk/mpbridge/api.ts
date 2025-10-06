import { ethers } from "ethers";

// GoodDollar Bridge API functions
export const fetchBridgeFees = async (retries = 1, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("https://goodserver.gooddollar.org/bridge/estimatefees");
      if (response.ok) {
        return await response.json();
      }

      // If rate limited (429), don't retry, just return null immediately
      if (response.status === 429) {
        console.log("Rate limited, using fallback fees instead of retrying");
        return null;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error(`Error fetching bridge fees (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
};

export const convertFeeToWei = (fee: string): string => {
  const feeValue = parseFloat(fee);
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
