import { Amplitude, Identify } from "@amplitude/react-native";
import { noop } from "lodash";

class Wrapper {
  private api = Amplitude.getInstance()
  readonly Identify = Identify

  // there's no setVersionName() on the native SDK
  setVersionName() {}

  async initialize(apiKey: string) {
    const { onError = noop } = options || {};
    const onSuccess = onReady || noop;

    return this.api.init(apiKey);
  }

  setUserId(id: string): void {
    this.api.setUserId(id);
  }

  setUserProperties(props: Record<string, unknown>) {
    this.api.setUserProperties(props);
  }

  logEvent(event: string, data: Record<string, unknown>) {
    this.api.logEvent(event, data);
  }
}

export default new Wrapper();
