import { isNumber, isString, isUndefined, negate, pickBy, remove, values } from 'lodash'

import { IAbstractProvider, IAnalyticsProvider } from '../types';
import api from './api'
import { IGoogleConfig } from './types';

export class GoogleAnalytics implements IAbstractProvider, IAnalyticsProvider {
  constructor(
    private config: IGoogleConfig
  ) {}

  async initialize(appProps: IAppProps): Promise<boolean> {
    return !!api
  }

  identify(email: string, identifier?: string | number): void {}

  send(event: string, data?: object): void {
    const _values = values(data || {});
    const { analyticsEvent } = this.config;
    const eventValues = remove(_values, isNumber)
    const eventStrings = remove(_values, isString)

    const eventData = {
      eventAction: event,
      eventValue: eventValues.shift(),
      eventLabel: eventStrings.shift() || eventValues.shift() || JSON.stringify(_values.shift()),
    }

    api.logEvent(analyticsEvent, pickBy(eventData, negate(isUndefined)));
  }
}
