import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { BridgeRequest } from "../types";
import { BridgeProvider, normalizeAmountTo18 } from "../constants";

export const useLayerZeroFee = (
  bridgeContract: ethers.Contract | null,
  bridgeProvider: BridgeProvider,
  account: string | undefined | null
) => {
  const layerZeroAdapterParams = useMemo(() => ethers.utils.solidityPack(["uint16", "uint256"], [1, 400000]), []);

  const computeLayerZeroFee = useCallback(
    async (request: BridgeRequest, fallbackFee?: ethers.BigNumber | null): Promise<ethers.BigNumber | undefined> => {
      if (!bridgeContract || bridgeProvider !== "layerzero" || !account) {
        return fallbackFee ?? undefined;
      }

      try {
        let lzChainId;
        try {
          lzChainId = await bridgeContract.toLzChainId(request.targetChainId);
          if (!lzChainId || lzChainId.toString() === "0") {
            return fallbackFee ?? undefined;
          }
        } catch (error) {
          return fallbackFee ?? undefined;
        }

        const normalizedAmount = normalizeAmountTo18(ethers.BigNumber.from(request.amount), request.sourceChainId);
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
    [account, bridgeContract, bridgeProvider, layerZeroAdapterParams]
  );

  return { computeLayerZeroFee };
};
