import { useFVLink, openLink, useWhitelistSync } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import { FVFlowProps } from "../core";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: () => void;
}

export const useFVModalAction = ({ firstName, method, onClose }: FVModalActionProps) => {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);
  const [verifying, setIsVerifying] = useState(true);
  const { fuseWhitelisted, currentWhitelisted, syncStatus } = useWhitelistSync();

  const handleFvFlow = useCallback(async () => {
    setLoading(true);
    if (fuseWhitelisted) {
      await syncStatus;
      setLoading(false);
      return;
    } else {
      await verify();
    }
  }, [fuseWhitelisted, currentWhitelisted, syncStatus]);

  const verify = useCallback(async () => {
    try {
      await fvlink?.getLoginSig();
      await fvlink?.getFvSig();
    } catch (e: any) {
      setLoading(false);
      return;
    }

    switch (method) {
      case "redirect": {
        const link = fvlink?.getLink(firstName, document.location.href, false);
        console.log("test for redirect back link -->", { link });

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
    setIsVerifying(false);
    onClose();
  }, [fvlink, method, firstName, onClose]);

  return { loading, handleFvFlow, verifying };
};
