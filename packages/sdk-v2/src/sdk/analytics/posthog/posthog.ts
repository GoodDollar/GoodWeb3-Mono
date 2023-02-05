import { default as PostHogAPI, PostHogOptions } from "posthog-react-native";
import { omit, clone, defaults } from "lodash";

import { IAbstractProvider, IAnalyticsProvider, IAppProps, IAbstractConfig } from "../types";
import { getUserProps } from "../utils";

export interface IPostHogConfig extends PostHogOptions, IAbstractConfig {
  apiKey?: string;
}

export class PostHog implements IAbstractProvider, IAnalyticsProvider {
  private config: any;
  private api: PostHogAPI | undefined = undefined;
  constructor(config: any) {
    this.config = defaults(clone(config));
  }

  async initialize(appProps: IAppProps): Promise<boolean> {
    const { apiKey } = this.config;

    if (!apiKey) {
      return false;
    }

    this.api = await PostHogAPI.initAsync(apiKey, {
      // PostHog API host (https://app.posthog.com by default)
      host: "https://app.posthog.com"
    });

    this.api.identify(undefined, { ...omit(appProps, "$once"), $set_once: appProps.$once });

    return true;
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);

    if (!this.api) {
      throw new Error("Posthog analytics not initialized!");
    }

    this.api.identify(id, extra);
  }

  send(event: string, data?: object): void {
    if (!this.api) {
      throw new Error("Posthog analytics not initialized!");
    }

    this.api.capture(event, data);
  }
}
