"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nconf_1 = require("nconf");
const lodash_1 = require("lodash");
class Config extends nconf_1.Provider {
    get(key) {
        let val = super.get(key);
        if (lodash_1.isNil(val))
            throw new Error(`Config key '${key}' is undefined`);
        return val;
    }
    has(key) {
        return !lodash_1.isNil(super.get(key));
    }
}
exports.Config = Config;
//# sourceMappingURL=Config.js.map