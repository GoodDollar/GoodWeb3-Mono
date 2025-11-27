import { useMemo } from "react";
import { useEthers, useCalls, QueryParams, CurrencyValue } from "@usedapp/core";
import { ethers, BigNumber } from "ethers";
import { useRefreshOrNever, useReadOnlyProvider } from "../../../hooks";
import { useGetEnvChainId, useG$Amount } from "../../base/react";
import { BRIDGE_CONSTANTS } from "../constants";

export function useProductionG$Balance(refresh: QueryParams["refresh"] = "never", requiredChainId?: number) {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();
  const { chainId: envChainId } = useGetEnvChainId(requiredChainId);
  const chainId = requiredChainId || envChainId;

  // Use production G$ token address instead of contract from deployment.json
  const productionG$Address = BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS;

  // Create a contract instance for production G$
  const readOnlyProvider = useReadOnlyProvider(chainId);
  const productionG$Contract = useMemo(() => {
    if (!readOnlyProvider) return null;

    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    return new ethers.Contract(productionG$Address, tokenABI, readOnlyProvider);
  }, [readOnlyProvider, productionG$Address]);

  // Query balance
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

  // Format balance as CurrencyValue matching useG$Balance interface
  const g$Balance = useG$Amount(g$Value, "G$", chainId) as CurrencyValue;

  return { G$: g$Balance };
}
