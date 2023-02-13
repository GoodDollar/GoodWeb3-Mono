import Mixpanel from "mixpanel-browser";

export const MixpanelAPI = {
  async init(...params) {
    Mixpanel.init(...params);
    return this;
  },
  registerSuperProperties(...params) {
    Mixpanel.register(...params);
  },
  registerSuperPropertiesOnce(...params) {
    Mixpanel.register_once(...params);
  },

  identify(...params) {
    Mixpanel.identify(...params);
  },
  track(...params) {
    Mixpanel.track(...params);
  },
  setUserProps(props) {
    return Mixpanel.people.set(props);
  },
  setUserPropsOnce(props) {
    return Mixpanel.people.set_once(props);
  }
};
