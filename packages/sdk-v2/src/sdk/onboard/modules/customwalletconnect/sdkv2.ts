import { fromEvent } from "rxjs";
import { take } from "rxjs/operators";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { default as defaultWcModule, isHexString } from "@web3-onboard/walletconnect";
import {
  GetInterfaceHelpers,
  ProviderAccounts,
  ProviderRpcError,
  WalletInit,
  WalletModule
} from "@web3-onboard/common";
import { ISession } from "@walletconnect/types";

import { getDevice } from "../../../base/utils/platform";
import { icons } from "./icons";

import { CustomLabels, WcConnectOptions } from "./types";

function customWc2Module(options: WcConnectOptions): WalletInit {
  if (!options || options.version !== 2) {
    throw new Error("WalletConnect requires a projectId. Please visit https://cloud.walletconnect.com to get one.");
  }
  const { customLabelFor: label, projectId, requiredChains, version } = options;
  const defaultWc = defaultWcModule({ projectId, version, requiredChains });

  return () => {
    const wc = defaultWc({ device: getDevice() }) as WalletModule;
    const { getInterface } = wc;

    wc.label = CustomLabels[label as keyof typeof CustomLabels];
    wc.getIcon = async () => icons[label];

    wc.getInterface = async (helpers: GetInterfaceHelpers) => {
      const ui = await getInterface(helpers);
      const { provider } = ui as { provider: any };
      const { connector, request } = provider;
      const { killSession } = connector;

      // hotfix: multiple killSession request send causing peerId error at disconnect
      connector.killSession = async function (sessionError?: ISession): Promise<void> {
        if (!this._connected) {
          return;
        }

        await killSession.call(this, sessionError);
      };

      // hack requests, SHOULD be function to keep provider instance's 'this' context
      provider.request = async function ({ method, params }: { method: string; params?: any }) {
        if (method !== "eth_requestAccounts") {
          return request({ method, params });
        }

        // for 'eth_requestAccounts' method only
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<ProviderAccounts>(async (resolve, reject) => {
          // Subscribe to connection events
          fromEvent(this.connector, "connect", payload => payload)
            .pipe(take(1))
            .subscribe({
              next: chainId => {
                this.emit("accountsChanged", this.connector.accounts);
                const hexChainId = isHexString(chainId as any) ? chainId : `0x${Number(chainId).toString(16)}`;
                this.emit("chainChanged", hexChainId);
                resolve(this.connector.accounts);
              },
              error: reject
            });
          // Check if connection is already established
          if (!this.connector.session) {
            // create new session
            await this.connector.connect().catch(err => {
              console.error("err creating new session: ", err);
              reject(
                new ProviderRpcError({
                  code: 4001,
                  message: "User rejected the request."
                })
              );
            });
          } else {
            // update ethereum provider to load accounts & chainId
            const accounts = this.connector.accounts;
            const chainId = this.connector.chainId;
            const hexChainId = `0x${chainId.toString(16)}`;
            this.emit("chainChanged", hexChainId);
            return resolve(accounts);
          }

          // Subscribe to connection events
          fromEvent(this.connector, "connect", (error: any, payload: any) => {
            if (error) {
              throw error;
            }

            return payload;
          })
            .pipe(take(1))
            .subscribe({
              next: ({ params }: { params: any }) => {
                const [{ accounts, chainId }] = params;
                this.emit("accountsChanged", accounts);
                this.emit("chainChanged", `0x${chainId.toString(16)}`);
                QRCodeModal.close();
                resolve(accounts);
              },
              error: reject
            });
        });
      };

      return ui;
    };

    return wc;
  };
}

export default customWc2Module;
