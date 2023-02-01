import { useFVLink, openLink, useWhitelistSync } from "@gooddollar/web3sdk-v2";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import { FVFlowProps } from "../core";

interface FVModalActionProps extends Pick<FVFlowProps, "method" | "firstName"> {
  onClose: (isVerifying: boolean) => Promise<void>;
}

export const useFVModalAction = ({ firstName, method, onClose }: FVModalActionProps) => {
  const fvlink = useFVLink();
  const [loading, setLoading] = useState(false);
  const [syncing, setIsSyncing] = useState(true);
  const { fuseWhitelisted, currentWhitelisted, whitelistSync } = useWhitelistSync();

  const handleFvFlow = useCallback(async () => {
    setLoading(true);

    if (!fuseWhitelisted || currentWhitelisted !== false) {
      setLoading(false);
      return;
    }

    const sync = await whitelistSync();

    if (!sync && (!fuseWhitelisted || !currentWhitelisted)) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setIsSyncing(false);
      setLoading(false);
    }, 10000);
  }, [fuseWhitelisted, currentWhitelisted, whitelistSync]);

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
  }, [fvlink, syncing, method, firstName, onClose]);

  return { loading, syncing, handleFvFlow, verify };
};
