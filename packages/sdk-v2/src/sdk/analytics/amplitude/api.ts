import { createInstance, Identify } from '@amplitude/analytics-browser';

class Wrapper {
  private api = createInstance()
  readonly Identify = Identify

  async initialize(apiKey: string) {
    return this.api.init(apiKey);
  }

  setUserId(id: string): void {
    this.api.setUserId(id);
  }

  setUserProperties(props: Record<string, unknown>) {
    // TODO: implement
  }

  logEvent(event: string, data: Record<string, unknown>) {
    this.api.logEvent(event, data);
  }
}

export default new Wrapper();
