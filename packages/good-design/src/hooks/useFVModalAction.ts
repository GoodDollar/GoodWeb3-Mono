import { useFVLink, openLink } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useState } from "react";

import { FVFlowProps } from "../core";
import { isTxReject } from "../utils/transactionType";
import { useRedirectUri } from "./useRedirectUri";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: () => void;
  onFvSig?: (fvSig: string) => Promise<void>;
  redirectUrl?: string;
  chainId?: number;
}

/**
 * Hook to handle getting a users signature and redirecting them to the FV flow to get whitelisted in the GoodDollar protocol
 * A connected web3-wallet is expected and your app should have implemented the Web3Provider which can be found in sdk-v2
 * @param {string} firstName - user's first name
 * @param {string} method - method to use for the action (popup (not fully implemented yet) or redirect)
 * @param {function} onClose - callback to handle
 * @param {function} onFvSig - callback to use the signature received from the connected wallet
 * @param {number} chainId - chain id to use for the FV link
 * @param {string} redirectUrl - url where a user should be redirected back to from the FV flow
 * @returns {boolean} loading - loading state, could be used to show a modal. There is default variant for the TxModal of type 'identity'
 * @returns {function} verify - function to call which will after receiving a signature from a connected wallet redirect user to the FV flow
 */
export const useFVModalAction = ({
  firstName,
  method,
  onClose = noop,
  onFvSig,
  chainId,
  redirectUrl
}: FVModalActionProps) => {
  const fvlink = useFVLink(chainId);
  const [loading, setLoading] = useState(false);
  const redirectUri = useRedirectUri(redirectUrl);

  const verify = useCallback(async () => {
    setLoading(true);

    try {
      const fvSig = await fvlink?.getFvSig();
      if (fvSig && onFvSig) void onFvSig(fvSig);
    } catch (e: any) {
      if (isTxReject(e)) {
        throw new Error(e);
      }
    } finally {
      setLoading(false);
    }

    onClose();

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, redirectUri, false);

        if (link) {
          openLink(link, "_self").catch(noop);
        }
        break;
      }
      case "popup":
      default: {
        const link = fvlink?.getLink(firstName, undefined, true);

        if (link) {
          openLink(link, "_blank", { width: "800px", height: "auto" }).catch(noop);
        }
        break;
      }
    }
  }, [fvlink, method, firstName, redirectUrl, onClose]);

  return { loading, verify };
};
