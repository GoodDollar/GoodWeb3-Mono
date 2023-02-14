"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mixpanel = void 0;
const api_1 = require("./api");
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
class Mixpanel {
    constructor(config) {
        this.config = (0, lodash_1.clone)(config);
    }
    async initialize(appProps) {
        const { apiKey } = this.config;
        if (!apiKey) {
            return false;
        }
        this.api = await api_1.MixpanelAPI.init(apiKey);
        this.api.registerSuperProperties((0, lodash_1.omit)(appProps, "$once"));
        this.api.registerSuperPropertiesOnce(appProps.$once || {});
        return true;
    }
    identify(identifier, email, props) {
        const { id, extra } = (0, utils_1.getUserProps)(identifier, email, props);
        if (!this.api) {
            throw new Error("Mixpanel analytics not initialized!");
        }
        this.api.identify(id);
        this.api.setUserProps(extra);
    }
    send(event, data) {
        if (!this.api) {
            throw new Error("Mixpanel analytics not initialized!");
        }
        this.api.track(event, data);
    }
}
exports.Mixpanel = Mixpanel;
//# sourceMappingURL=mixpanel.js.map