"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadConfig_1 = require("./loadConfig");
const lodash_1 = require("lodash");
let test_submod_conf = require("./config/index.js");
let conf = loadConfig_1.loadConfig();
console.log("sub module: " + JSON.stringify(test_submod_conf, null, 2));
console.log("main: " + JSON.stringify(conf, null, 2));
let diff = _getObjectDiff(test_submod_conf, conf);
if (diff.length > 0) {
    console.log("diff: " + diff.toString());
    throw new Error("test_submod_conf !== conf, but they should be");
}
console.log(`${conf.get("name")}`);
if (conf.get("port") !== 80) {
    throw new Error("conf.get('port') !== 80");
}
console.log(`port=${conf.get("port")}`);
console.log(`env=${conf.has("transporter.nats") ? "production" : "dev"}`);
console.log(`transporter=${JSON.stringify(conf.get("transporter.nats"))}`);
function _getObjectDiff(obj1, obj2) {
    const diff = Object.keys(obj1).reduce((result, key) => {
        if (!obj2.hasOwnProperty(key)) {
            result.push(key);
        }
        else if (lodash_1.isEqual(obj1[key], obj2[key])) {
            const resultKeyIndex = result.indexOf(key);
            result.splice(resultKeyIndex, 1);
        }
        return result;
    }, Object.keys(obj2));
    return diff;
}
//# sourceMappingURL=test.js.map