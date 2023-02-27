import { Mixpanel } from "mixpanel-react-native";

Mixpanel.prototype["setUserProps"] = async function (props) {
  return this.getPeople().set(props);
};
Mixpanel.prototype["setUserPropsOnce"] = async function (props) {
  return this.getPeople().setOnce(props);
};

interface MixPanelNative extends Mixpanel {
  setUserProps(props): void;
  setUserPropsOnce(props): void;
}

export const MixpanelAPI = {
  async init(apiKey) {
    const mixpanel = new Mixpanel(apiKey, false);
    await mixpanel.init();
    return mixpanel as MixPanelNative;
  }
};
