import { omit } from 'lodash'

import { IAbstractProvider, IAnalyticsProvider, IAppProps } from '../types';
import { getUserProps } from '../utils';
import api from './api'
import { IGoogleConfig } from './types';

export class GoogleAnalytics implements IAbstractProvider, IAnalyticsProvider {
  constructor(
    private config: IGoogleConfig
  ) {}

  async initialize(appProps: IAppProps): Promise<boolean> {
    const initialized = !!api;

    if (initialized) {
      api!.setDefaultEventParams(omit(appProps, '$once'))
    }

    return initialized
  }

  identify(identifier: string | number, email?: string, props?: object): void {
    const { id, extra } = getUserProps(identifier, email, props);

    api!.setUserId(id);
    api!.setUserProperties(extra);
  }

  send(event: string, data?: object): void {
    api!.logEvent(event, data);
  }
}
