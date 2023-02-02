import { useFVLink, openLink } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { FVFlowProps } from "../core";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: () => void;
  redirectUrl?: string;
  chainId?: number;
  whitelistAtChain?: boolean;
}

export const useFVModalAction = ({ 
  firstName, 
  method, 
  chainId,
  onClose = noop, 
  redirectUrl,
  whitelistAtChain = false
}: FVModalActionProps) => {
  const fvlink = useFVLink(chainId, whitelistAtChain);
  const [loading, setLoading] = useState(false);
  const redirectUri = useMemo(() => redirectUrl || document.location.href, [redirectUrl]);

  const verify = useCallback(async () => {
    setLoading(true);

    await fvlink?.getLoginSig();
    await fvlink?.getFvSig();

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

    setLoading(false);
    onClose();
  }, [fvlink, method, firstName, onClose]);

  return { loading, verify };
};
