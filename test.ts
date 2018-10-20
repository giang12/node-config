import { loadConfig } from "./loadConfig";
import { isEqual } from "lodash";

//@TODO proper unit tests...
//
const test_submod_conf = require("./config/index.js");

const conf = loadConfig(["./config", "./.config", "~/config", "/config"]); //extendDeep([srcs])

const test_modname_conf = loadConfig(null, { verbose: true });

console.log("sub module: " + JSON.stringify(test_submod_conf, null, 2));
console.log("main: " + JSON.stringify(conf, null, 2));

let diff = _getObjectDiff(test_submod_conf, conf);
if (diff.length > 0) {
    console.log("diff: " + diff.toString());
    throw new Error("test_submod_conf !== conf, but they should be");
}

if (test_modname_conf.get("name") !== "noname") {
    throw new Error(`name !== noname, got ${test_modname_conf.get("name")}`);
}

if (
    !test_modname_conf.get("lookup_conf_from_mod_name") ||
    test_modname_conf.get("lookup_conf_from_mod_name") !==
        test_submod_conf.get("lookup_conf_from_mod_name") ||
    test_modname_conf.get("lookup_conf_from_mod_name") !==
        conf.get("lookup_conf_from_mod_name")
) {
    throw new Error("cant look up configs based on mod name");
}

if (conf.get("port") !== 80) {
    throw new Error("conf.get('port') !== 80");
}
console.log(`${conf.get("name")}`); //only defined in production env

console.log(`port=${conf.get("port")}`); //only defined in production env

console.log(`env=${conf.has("transporter.nats") ? "production" : "dev"}`);

console.log(`transporter=${JSON.stringify(conf.get("transporter.nats"))}`); //only defined in production env
console.log(`kafka_cluster=${JSON.stringify(conf.get("kafka_cluster"))}`); //only defined in production env

function _getObjectDiff(obj1, obj2) {
    const diff = Object.keys(obj1).reduce((result, key) => {
        if (!obj2.hasOwnProperty(key)) {
            result.push(key);
        } else if (isEqual(obj1[key], obj2[key])) {
            const resultKeyIndex = result.indexOf(key);
            result.splice(resultKeyIndex, 1);
        }
        return result;
    }, Object.keys(obj2));

    return diff;
}
