import { Amplitude, Identify } from "@amplitude/react-native";
import { noop } from "lodash";

class Wrapper {
  private api = Amplitude.getInstance()
  readonly Identify = Identify

  // there's no setVersionName() on the native SDK
  setVersionName() {}

  initialize(apiKey: string, _: any, options?: Record<string, any>, onReady?: Function) {
    const { onError = noop } = options || {};
    const onSuccess = onReady || noop;

    this.api
      .init(apiKey)
      .then(async (initialized: boolean) => {
        if (!initialized) {
          throw new Error("Amplitude not initialized !");
        }

        onSuccess();
      })
      .catch(onError);
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
