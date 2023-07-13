import { default as defaultWcModule, WalletConnectOptions } from "@web3-onboard/walletconnect";
import { icons } from "./icons";
import { CustomLabels } from "./types";

import { WalletInit, WalletModule } from "@web3-onboard/common";
import { getDevice } from "../../../base/utils";

export const customwc = (options: WalletConnectOptions & { label: keyof typeof CustomLabels }): WalletInit => {
  // desctructure label from wc-options here because of a new validation on initialization props
  const { label, ...rest } = options;
  const defaultWC = defaultWcModule(rest);

  return () => {
    const walletInit = defaultWC({ device: getDevice() }) as WalletModule;

    walletInit.label = CustomLabels[label];
    walletInit.getIcon = async () => icons[label].svg;
    return walletInit;
  };
};
