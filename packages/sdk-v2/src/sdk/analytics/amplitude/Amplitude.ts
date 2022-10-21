import { AbstractProvider, IAbstractProvider, IAnalyticsProvider, IAppProps } from "../types";
import { IAmplitudeConfig } from "./types";

import api from './api'

class Amplitude extends AbstractProvider implements IAnalyticsProvider {
  constructor(
    appProps: IAppProps,
    private config: IAmplitudeConfig
  ) {
    super(appProps);
  }

  async initialize(): Promise<boolean> {
    if (!api) {
      return false
    }

    const initialized = await new Promise(resolve => {
      const { apiKey } = this.config
      const [onError, onSuccess] = [false, true].map(state => () => resolve(state))

      api.init(apiKey, null, { includeUtm: true, onError }, onSuccess)
    })

    if (initialized) {
      const identity = new api.Identify()
      const { env, version, osVersion } = this.appProps

      identity.setOnce('first_open_date', new Date().toString())
      identity.append('env', env)

      api.setVersionName(version)
      api.identify(identity)
      api.setUserProperties({ os_version: osVersion })
    }

    return initialized
  }

  identify(email: string, identifier: string | number): void {

  }

  send(event: string, data?: object): void {

  }
}