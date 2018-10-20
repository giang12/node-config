"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path"), callerId = require("caller-id");
const pkgDir = require("pkg-dir"), readPkgUp = require("read-pkg-up");
const lodash_1 = require("lodash");
function loadConfig(confDirs, opts) {
    process.env.ALLOW_CONFIG_MUTATIONS = "y";
    let opt = lodash_1.defaults({}, opts, {
        verbose: false,
        strict: false
    });
    confDirs = Array.isArray(confDirs)
        ? confDirs
        : typeof confDirs === "string"
            ? [confDirs]
            : [];
    const log = opt.verbose ? console.log : function () { };
    const caller = callerId.getData(loadConfig), CALLER_DIR = path.dirname(caller.filePath), PROJ_ROOT = pkgDir.sync(CALLER_DIR), PKG = readPkgUp.sync({ cwd: CALLER_DIR }).pkg, CWD = process.cwd(), HOME = process.env.USERPROFILE || process.env.HOME, ROOT = "/", NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR;
    log(caller);
    log(PROJ_ROOT);
    log("module name %s", PKG.name);
    let config = _loadConfig(CALLER_DIR, opt.strict);
    let lookuppaths = [
        ["caller config", path.join(CALLER_DIR, "config")],
        ["caller .config", path.join(CALLER_DIR, ".config")],
        ["caller config mod", path.join(CALLER_DIR, "config", PKG.name)],
        ["caller .config mod", path.join(CALLER_DIR, ".config", PKG.name)],
        ["project", path.resolve(PROJ_ROOT)],
        ["project config", path.join(PROJ_ROOT, "config")],
        ["project .config", path.join(PROJ_ROOT, ".config")],
        ["project configmod", path.join(PROJ_ROOT, "config", PKG.name)],
        ["project .config mod", path.join(PROJ_ROOT, ".config", PKG.name)],
        ["cwd", path.resolve(CWD)],
        ["cwd config", path.join(CWD, "config")],
        ["cwd .config", path.join(CWD, ".config")],
        ["cwd config mod", path.join(CWD, "config", PKG.name)],
        ["cwd .config mod", path.join(CWD, ".config", PKG.name)],
        ["home", path.join(HOME, "config")],
        [".home", path.join(HOME, ".config")],
        ["home mod", path.join(HOME, "config", PKG.name)],
        [".home mod", path.join(HOME, ".config", PKG.name)],
        ["etc", path.resolve("/etc/config/")],
        [".etc", path.resolve("/etc/.config/")],
        ["etc mod", path.join("/etc/", "config", PKG.name)],
        [".etc mod", path.join("/etc/", ".config", PKG.name)],
        ["root", path.join(ROOT, "config")],
        [".root", path.join(ROOT, ".config")],
        ["root mod", path.join(ROOT, "config", PKG.name)],
        [".root mod", path.join(ROOT, ".config", PKG.name)]
    ];
    confDirs.forEach((dir, idx) => {
        lookuppaths.push(["jiggy custom override " + idx, path.resolve(dir)]);
        lookuppaths.push([
            "jiggy custom mod override" + idx,
            path.join(dir, PKG.name)
        ]);
    });
    if (NODE_CONFIG_DIR && NODE_CONFIG_DIR != "undefined") {
        lookuppaths.push([
            "NODE_CONFIG_DIR custom override",
            path.resolve(NODE_CONFIG_DIR)
        ]);
        lookuppaths.push([
            "NODE_CONFIG_DIR custom override",
            path.join(NODE_CONFIG_DIR, PKG.name)
        ]);
    }
    lookuppaths.forEach(lp => {
        const c = config.util.loadFileConfigs(lp[1]);
        log(lp[0] + "@" + lp[1] + ": " + JSON.stringify(c, null, 2));
        config.util.extendDeep(config, c);
    });
    log(config);
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