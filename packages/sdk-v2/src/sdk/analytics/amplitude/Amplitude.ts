import { forOwn, filter, assign } from "lodash";
import { IAbstractProvider, IAnalyticsProvider, IAppProps, IMonitoringProvider } from "../types";
import { IAmplitudeConfig } from "./types";

import api from "./api";
import { getUserProps } from "../utils";

export class Amplitude implements IAbstractProvider, IAnalyticsProvider, IMonitoringProvider {
  constructor(private config: IAmplitudeConfig) {}

  async initialize(appProps: IAppProps): Promise<boolean> {
    const initialized = await new Promise<boolean>(resolve => {
      const { apiKey } = this.config;
      const [onError, onSuccess] = [false, true].map(state => () => resolve(state));

      if (!apiKey) {
        onError();
        return;
      }

      api.init(apiKey, undefined, { includeUtm: true, onError }, onSuccess);
    });

    if (initialized) {
      const identity = new api.Identify();
      const { env, version, osVersion, $once = {}, ...tags } = appProps;
      const allTags = { env, version, os_version: osVersion, ...tags };

      forOwn(allTags, (value: string, key: string) => identity.append(key, value));
      forOwn($once, (value: string, key: string) => identity.setOnce(key, value));

      api.setVersionName(version);
      api.identify(identity);
    }

    return initialized;
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);

    api.setUserId(id);
    api.setUserProperties(extra);
  }

  send(event: string, data?: object): void {
    const eventData: object = data || {};

    api.logEvent(event, eventData);
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
}
