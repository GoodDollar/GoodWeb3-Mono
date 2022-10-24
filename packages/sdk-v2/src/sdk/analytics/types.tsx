import { isFunction } from 'lodash'

export enum ProviderType {
  Amplitude = "amplitude",
  GoogleAnalytics = "google",
  Sentry = "sentry"
}

export type IAppProps = Record<string, string> & {
  env: string;
  version: string;
  osVersion: string;
  $once?: Record<string, string>
}

export interface IAbstractConfig {
  enabled: boolean;
}

export interface IAbstractProvider {
  initialize(appProps: IAppProps): Promise<boolean>;
  identify(email: string, identifier: string | number, props?: object): void;
}

export interface IAnalyticsProvider {
  send(event: string, data?: object): void;
}

export interface IMonitoringProvider {
  capture(exception: Error, fingerprint?: string[], tags?: object, extra?: object): void;
}

export interface IProvider extends Partial<IAbstractProvider>, Partial<IAnalyticsProvider>, Partial<IMonitoringProvider> {};

export function supportsAnalytics(provider: IProvider): provider is IAnalyticsProvider {
  return 'send' in provider && isFunction(provider['send']);
}

export function supportsMonitoring(provider: IProvider): provider is IMonitoringProvider {
  return 'capture' in provider && isFunction(provider['capture']);
}
