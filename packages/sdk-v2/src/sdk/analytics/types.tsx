import { isFunction } from 'lodash'

export interface IAppProps {
  env: string;
  version: string;
  osVersion: string;
}

export interface IAbstractConfig {
  enabled: boolean;
}

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

export abstract class AbstractProvider implements IAbstractProvider {
  constructor(
    protected appProps: IAppProps
  ) {}

  abstract initialize(): Promise<boolean>;
  abstract identify(email: string, identifier: string | number): void;
}

export function supportsAnalytics(provider: IAnalyticsProvider | IMonitoringProvider): provider is IAnalyticsProvider {
  return 'send' in provider && isFunction(provider['send']);
}

export function supportsMonitoring(provider: IAnalyticsProvider | IMonitoringProvider): provider is IMonitoringProvider {
  return 'capture' in provider && isFunction(provider['capture']);
}
