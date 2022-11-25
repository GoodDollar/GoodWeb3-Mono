import { forOwn, filter, assign } from "lodash";
import { IAbstractProvider, IAnalyticsProvider, IAppProps, IMonitoringProvider } from "../types";
import { IAmplitudeConfig } from "./types";

import { init, identify, setUserId, logEvent, Identify } from "./api";
import { getUserProps } from "../utils";

export class Amplitude implements IAbstractProvider, IAnalyticsProvider, IMonitoringProvider {
  constructor(private config: IAmplitudeConfig) {}

  async initialize(appProps: IAppProps): Promise<boolean> {
    const { apiKey } = this.config;
    let initialized = false;
    
    if (apiKey) {
      initialized = await init(apiKey!).then(Boolean);
    }
    
    if (initialized) {
      const { env, version, osVersion, $once = {}, ...tags } = appProps;
      const allTags = { env, version, os_version: osVersion, ...tags };
      const identity = this.identifyFromProps(allTags);

      forOwn($once, (value: string, key: string) => identity.setOnce(key, value));
      identify(identity);
    }

    return initialized;
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);
    const identity = this.identifyFromProps(extra);

    setUserId(id);
    identify(identity);
  }

  send(event: string, data?: object): void {
    const eventData: object = data || {};

    logEvent(event, eventData);
  }

  capture(exception: Error, fingerprint?: string[], tags?: object, extra?: object): void {
    const { errorEvent } = this.config;
    const { name, message } = exception;
    const data: Record<string, any> = { error: message, reason: name };

    if (!errorEvent) {
      return;
    }

    if (fingerprint) {
      data.unique = fingerprint.join(" ");
    }

    assign(data, ...filter([tags, extra]));
    this.send(errorEvent, data);
  }

  private identifyFromProps(props: object): Identify {
    const identity = new Identify();

    forOwn(props, (value: string, key: string) => identity.append(key, value));
    return identify;
  }
}
