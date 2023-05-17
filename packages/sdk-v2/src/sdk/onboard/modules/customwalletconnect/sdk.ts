import { default as defaultWcModule, WalletConnectOptions } from "@web3-onboard/walletconnect";
import { icons } from "./icons";
import { CustomLabels } from "./types";

import { WalletInit, WalletModule } from "@web3-onboard/common";
import { getDevice } from "../../../base/utils";

export const customwc = (options: WalletConnectOptions & { label: keyof typeof CustomLabels }): WalletInit => {
  const defaultWC = defaultWcModule(options);

  return () => {
    const walletInit = defaultWC({ device: getDevice() }) as WalletModule;

    walletInit.label = CustomLabels[options.label];
    walletInit.getIcon = async () => icons[options.label].svg;
    return walletInit;
  };
};
