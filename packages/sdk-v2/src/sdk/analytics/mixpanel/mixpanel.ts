import { MixpanelAPI } from "./api";
import { omit, clone, defaults } from "lodash";

import { IAbstractProvider, IAnalyticsProvider, IAppProps, IAbstractConfig } from "../types";
import { getUserProps } from "../utils";

export interface IMixpanelAPI {
  init(...params): void;
  registerSuperProperties(...params): void;
  registerSuperPropertiesOnce(...params): void;
  identify(...params): void;
  track(...params): void;
  setUserProps(props): any;
}

export interface IMixpanelConfig extends IAbstractConfig {
  apiKey?: string;
  trackAutomaticEvents?: string;
}

export class Mixpanel implements IAbstractProvider, IAnalyticsProvider {
  private config: any;
  private api: IMixpanelAPI | undefined;
  constructor(config: any) {
    this.config = defaults(clone(config));
  }

  async initialize(appProps: IAppProps): Promise<boolean> {
    const { apiKey } = this.config;

    if (!apiKey) {
      return false;
    }

    this.api = await MixpanelAPI.init(apiKey);
    this.api.registerSuperProperties(omit(appProps, "$once"));
    this.api.registerSuperPropertiesOnce(appProps.$once || {});
    return true;
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);

    if (!this.api) {
      throw new Error("Mixpanel analytics not initialized!");
    }

    this.api.identify(id);
    this.api.setUserProps(extra);
  }

  send(event: string, data?: object): void {
    if (!this.api) {
      throw new Error("Mixpanel analytics not initialized!");
    }

    this.api.track(event, data);
  }
}
