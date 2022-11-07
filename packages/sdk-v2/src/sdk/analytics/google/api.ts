import { forOwn } from 'lodash'

const { dataLayer } = <any>window

interface IAbstractDataModel {
  set<T = any>(prop: string, value: T): void;
  get<T = any>(prop: string): T | null;
  reset(): void;
}

class DataLayer {
  setDefaultEventParams(params: object = {}) {
    // set vars by one according data layer docs
    forOwn(params, (value, key) => dataLayer.push({ [key]: value }))
  }

  setUserId(id: string): any {
    this.setUserProperties({ id })
  }

  // merges user data between calls
  setUserProperties(props: Record<string, any> = {}) {
    dataLayer.push(function(this: IAbstractDataModel) {
      const user = this.get('user') || {}
      const newProps = { ...user, ...props }

      this.set('user', newProps)
      dataLayer.push({ user: newProps })
    });
  }

  logEvent(event: string, data: any = {}) {
    dataLayer.push({ event, ...data })
  }
}

export default !dataLayer ? null : new DataLayer()
