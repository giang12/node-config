"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path"), callerId = require("caller-id");
const pkgDir = require("pkg-dir");
const lodash_1 = require("lodash");
function loadConfig(confDir, opts) {
    let opt = lodash_1.defaults({}, opts, {
        verbose: false,
        strict: false
    });
    const caller = callerId.getData(loadConfig), CALLER_DIR = path.dirname(caller.filePath), PROJ_ROOT = pkgDir.sync(CALLER_DIR), CWD = process.cwd(), HOME = process.env.USERPROFILE || process.env.HOME;
    if (opt.verbose) {
        console.log(caller);
        console.log(PROJ_ROOT);
    }
    let config = _loadConfig(CALLER_DIR, opt.strict);
    let lookuppaths = [
        ["caller config", path.join(CALLER_DIR, "config")],
        ["caller .config", path.join(CALLER_DIR, ".config")],
        ["project", PROJ_ROOT],
        ["project config", path.join(PROJ_ROOT, "config")],
        ["project .config", path.join(PROJ_ROOT, ".config")],
        ["cwd", CWD],
        ["cwd config", path.join(CWD, "config")],
        ["cwd .config", path.join(CWD, ".config")],
        ["home", path.join(HOME, "config")],
        [".home", path.join(HOME, ".config")],
        ["etc", "/etc/config/"]
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