"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path"), callerId = require("caller-id");
const lodash_1 = require("lodash");
function loadConfig(confDir, opts) {
    let opt = lodash_1.defaults({}, opts, {
        verbose: false,
        strict: false
    });
    let caller = callerId.getData(loadConfig);
    let config = _loadConfig(path.dirname(caller.filePath), opt.strict);
    let PROJECT_ROOT = process.cwd();
    let lookuppaths = [
        ["etc", "/etc/config/"],
        [
            "home",
            path.join(process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT, "config")
        ],
        [
            ".home",
            path.join(process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT, ".config")
        ],
        ["project config", path.join(PROJECT_ROOT, "config")],
        ["project .config", path.join(PROJECT_ROOT, ".config")],
        ["project root", PROJECT_ROOT]
    ];
    if (confDir)
        lookuppaths.push(["jiggy custom override", confDir]);
    if (process.env.NODE_CONFIG_DIR)
        lookuppaths.push([
            "NODE_CONFIG_DIR custom override",
            process.env.NODE_CONFIG_DIR
        ]);
    lookuppaths.forEach(lp => {
        config.util.extendDeep(config, config.util.loadFileConfigs(lp[1]));
    });
    if (opt.verbose)
        console.log(config);
    return config;
}
exports.loadConfig = loadConfig;
function _loadConfig(configFolder, strict) {
    process.env.SUPPRESS_NO_CONFIG_WARNING = "y";
    delete require.cache[require.resolve("config")];
    let originalCErr;
    if (!strict) {
        originalCErr = console.error;
        console.error = function () { };
    }
    let oldConfigFolder = process.env.NODE_CONFIG_DIR;
    process.env.NODE_CONFIG_DIR = configFolder;
    let config = require("config");
    process.env.NODE_CONFIG_DIR = oldConfigFolder;
    if (!strict) {
        console.error = originalCErr;
    }
    return config;
}
//# sourceMappingURL=loadConfig.js.map