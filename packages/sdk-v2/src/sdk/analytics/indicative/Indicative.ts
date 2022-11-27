import { omit, clone, defaults } from "lodash";

import { IAbstractProvider, IAnalyticsProvider, IAppProps } from "../types";
import { getUserProps } from "../utils";
import { IndicativeAPIWebSdk as apiSdk } from "./api";
import { IIndicativeConfig, defaultConfig } from "./types";

const api = apiSdk && new apiSdk();

export class Indicative implements IAbstractProvider, IAnalyticsProvider {
  private config: IIndicativeConfig;

  constructor(config: IIndicativeConfig) {
    this.config = defaults(clone(config), defaultConfig);
  }

  async initialize(appProps: IAppProps): Promise<boolean> {
    const { apiKey } = this.config;

    if (!api) {
      return false;
    }

    const initialized = await api.initialize(apiKey!);

    if (initialized) {
      api!.addProperties(omit(appProps, "$once"));
    }

    return initialized;
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);
    const { userProperty } = this.config;

    api!.setUniqueID(id);
    api!.addProperties({ [userProperty!]: extra });
  }

  send(event: string, data?: object): void {
    api!.buildEvent(event, data);
  }
}
