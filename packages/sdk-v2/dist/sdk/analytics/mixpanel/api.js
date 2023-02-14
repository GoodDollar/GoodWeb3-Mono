"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixpanelAPI = void 0;
const mixpanel_browser_1 = __importDefault(require("mixpanel-browser"));
exports.MixpanelAPI = {
    async init(...params) {
        mixpanel_browser_1.default.init(...params);
        return this;
    },
    registerSuperProperties(...params) {
        mixpanel_browser_1.default.register(...params);
    },
    registerSuperPropertiesOnce(...params) {
        mixpanel_browser_1.default.register_once(...params);
    },
    identify(...params) {
        mixpanel_browser_1.default.identify(...params);
    },
    track(...params) {
        mixpanel_browser_1.default.track(...params);
    },
    setUserProps(props) {
        return mixpanel_browser_1.default.people.set(props);
    },
    setUserPropsOnce(props) {
        return mixpanel_browser_1.default.people.set_once(props);
    }
};
//# sourceMappingURL=api.js.map