import { useFVLink } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import { FVFlowProps, openLink } from "../core";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: () => void;
}

export const useFVModalAction = ({ firstName, method, onClose }: FVModalActionProps) => {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);

    await fvlink?.getLoginSig();
    await fvlink?.getFvSig();

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, document.location.href, false);

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
