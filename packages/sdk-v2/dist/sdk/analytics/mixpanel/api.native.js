"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixpanelAPI = void 0;
const mixpanel_react_native_1 = require("mixpanel-react-native");
mixpanel_react_native_1.Mixpanel.prototype["setUserProps"] = async function (props) {
    return this.getPeople().set(props);
};
mixpanel_react_native_1.Mixpanel.prototype["setUserPropsOnce"] = async function (props) {
    return this.getPeople().setOnce(props);
};
exports.MixpanelAPI = {
    async init(apiKey) {
        return (await mixpanel_react_native_1.Mixpanel.init(apiKey, false));
    }
};
//# sourceMappingURL=api.native.js.map