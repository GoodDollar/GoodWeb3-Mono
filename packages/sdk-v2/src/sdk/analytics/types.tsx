import { isFunction } from 'lodash'

export interface IAbstractProvider {
  initialize(): Promise<boolean>;
  identify(email: string, identifier: string | number): void;
}

export interface IAnalyticsProvider {
  send(event: string, data?: object): void;
}

export interface IMonitoringProvider {
  capture(exception: Error, fingerprint?: string[], tags?: object, extra?: object): void;
}

export function supportsAnalytics(provider: IAnalyticsProvider | IMonitoringProvider): provider is IAnalyticsProvider {
  return 'send' in provider && isFunction(provider['send']);
}

export function supportsMonitoring(provider: IAnalyticsProvider | IMonitoringProvider): provider is IMonitoringProvider {
  return 'capture' in provider && isFunction(provider['capture']);
}
