import { useMemo } from "react";
import { useEthers, useCalls, QueryParams, CurrencyValue } from "@usedapp/core";
import { ethers, BigNumber } from "ethers";
import { useRefreshOrNever, useReadOnlyProvider } from "../../../hooks";
import { useGetEnvChainId, useG$Amount } from "../../base/react";
import { BRIDGE_CONSTANTS } from "../constants";

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export function useProductionG$Balance(refresh: QueryParams["refresh"] = "never", requiredChainId?: number) {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();
  const { chainId: envChainId } = useGetEnvChainId(requiredChainId);
  const chainId = requiredChainId || envChainId;

  const productionG$Address = useMemo(() => {
    const address = BRIDGE_CONSTANTS.GDOLLAR_ADDRESSES[chainId] || BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS;
    return ethers.utils.getAddress(address);
  }, [chainId]);

  const readOnlyProvider = useReadOnlyProvider(chainId);
  const productionG$Contract = useMemo(() => {
    if (!readOnlyProvider) return null;
    return new ethers.Contract(productionG$Address, TOKEN_ABI, readOnlyProvider);
  }, [readOnlyProvider, productionG$Address]);

  const results = useCalls(
    productionG$Contract && account
      ? [
          {
            contract: productionG$Contract,
            method: "balanceOf",
            args: [account]
          }
        ]
      : [],
    {
      refresh: refreshOrNever,
      chainId
    }
  );

  const g$Value = results[0]?.value?.[0] as BigNumber | undefined;
  const hasError = results[0]?.error !== undefined;
  const g$Balance = useG$Amount(hasError ? undefined : g$Value, "G$", chainId) as CurrencyValue;

  return { G$: g$Balance };
}
