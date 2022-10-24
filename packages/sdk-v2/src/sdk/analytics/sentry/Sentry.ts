import { get, omit, forOwn } from 'lodash'

import { IAbstractProvider, IMonitoringProvider } from '../types'
import api from './api'
import { ISentryConfig } from './types'

export class Sentry implements IAbstractProvider, IMonitoringProvider {
  constructor(
    private config: ISentryConfig
  ) {}

  async initialize(appProps: IAppProps): Promise<boolean> {
    const { sentryDSN } = this.config;
    const { env, version, ...tags } = omit(appProps, 'osVersion', '$once')
    const sentryScope = { appVersion: version, ...tags }

    if (!sentryDSN) {
      return false;
    }

    api.init({
      dsn: sentryDSN,
      environment: env,
    })

    api.configureScope((scope: any) =>
      forOwn(sentryScope, (value: string, property: string) =>
        scope.setTag(property, value))
    );

    return true;
  }

  identify(email: string, identifier?: string | number, props?: object): void {
    const id: string = String(identifier || email)
    const extra = props || {}

    api.configureScope((scope: any) => {
      const user = get(scope, '_user', {})

      scope.setUser({ ...user, id, email, ...extra })
    })
  }

  capture(exception: Error, fingerprint?: string[], tags?: object, extra?: object): void {
    api.configureScope((scope: any) => {
      // set extra
      forOwn(extra || {}, (value: any, key: string) => scope.setExtra(key, value))

      // set tags
      forOwn(tags || {}, (value: any, key: string) => scope.setTag(key, value))

      if (fingerprint) {
        scope.setFingerprint(fingerprint)
      }

      api.captureException(exception)
    })
  }
}
