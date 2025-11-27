import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { BridgeRequest } from "../types";
import { BridgeProvider } from "../constants";

export const useLayerZeroFee = (
  bridgeContract: ethers.Contract | null,
  bridgeProvider: BridgeProvider,
  account: string | undefined | null,
  tokenDecimals: number | undefined,
  gdContract: any
) => {
  const layerZeroAdapterParams = useMemo(() => ethers.utils.solidityPack(["uint16", "uint256"], [1, 400000]), []);

  const normalizeAmountTo18 = useCallback((amount: ethers.BigNumber, decimals?: number) => {
    if (!amount) {
      return ethers.BigNumber.from(0);
    }

    const tokenDec = decimals ?? 18;

    if (tokenDec === 18) {
      return amount;
    }

    const diff = Math.abs(tokenDec - 18);
    const scale = ethers.BigNumber.from(10).pow(diff);

    if (tokenDec < 18) {
      return amount.mul(scale);
    }

    return amount.div(scale);
  }, []);

  const computeLayerZeroFee = useCallback(
    async (request: BridgeRequest, fallbackFee?: ethers.BigNumber | null): Promise<ethers.BigNumber | undefined> => {
      if (!bridgeContract || bridgeProvider !== "layerzero" || !account) {
        return fallbackFee ?? undefined;
      }

      try {
        let lzChainId;
        try {
          lzChainId = await bridgeContract.toLzChainId(request.targetChainId);
          // If toLzChainId returns 0 or falsy, use fallback fee - proxy will handle routing
          if (!lzChainId || lzChainId.toString() === "0") {
            return fallbackFee ?? undefined;
          }
        } catch (error) {
          return fallbackFee ?? undefined;
        }

        let decimals = tokenDecimals;

        if (decimals === undefined && gdContract) {
          const fetchedDecimals = await gdContract.decimals();
          decimals = Number(fetchedDecimals);
        }

        const normalizedAmount = normalizeAmountTo18(ethers.BigNumber.from(request.amount), decimals);
        const destination = request.target;
        if (!destination) {
          return fallbackFee ?? undefined;
        }

        const [nativeFee] = await bridgeContract.estimateSendFee(
          lzChainId,
          account,
          destination,
          normalizedAmount,
          false,
          layerZeroAdapterParams
        );

        if (!fallbackFee) {
          return nativeFee;
        }

        return nativeFee.gt(fallbackFee) ? nativeFee : fallbackFee;
      } catch (error: any) {
        return fallbackFee ?? undefined;
      }
    },
    [account, bridgeContract, bridgeProvider, gdContract, layerZeroAdapterParams, normalizeAmountTo18, tokenDecimals]
  );

  return { computeLayerZeroFee };
};
