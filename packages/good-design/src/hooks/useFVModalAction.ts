import { useFVLink, openLink } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import { FVFlowProps } from "../core";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: () => void;
  redirectUrl?: string;
}

export const defaultRedirect = document.location.href;

export const useFVModalAction = ({ firstName, method, redirectUrl = defaultRedirect }: FVModalActionProps) => {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);

    try {
      await fvlink?.getLoginSig();
      await fvlink?.getFvSig();
    } catch (e: any) {
      setLoading(false);
      return;
    }

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, redirectUrl, false);

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
  }, [fvlink, method, firstName, redirectUrl]);

  return { loading, verify };
};
