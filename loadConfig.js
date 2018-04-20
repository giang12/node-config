"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path'), callerId = require('caller-id');
const pkgDir = require('pkg-dir');
const lodash_1 = require("lodash");
function loadConfig(confDir, opts) {
    let opt = lodash_1.defaults({}, opts, {
        verbose: false,
        strict: false
    });
    let caller = callerId.getData(loadConfig), callerDir = path.dirname(caller.filePath), projectRoot = pkgDir.sync(callerDir), cwd = process.cwd();
    if (opt.verbose) {
        console.log(caller);
        console.log(projectRoot);
    }
    let config = _loadConfig(callerDir, opt.strict);
    let lookuppaths = [
        ['caller config', path.join(callerDir, 'config')],
        ['caller .config', path.join(callerDir, '.config')],
        ['project root', projectRoot],
        ['project config', path.join(projectRoot, 'config')],
        ['project .config', path.join(projectRoot, '.config')],
        ['cwd root', cwd],
        ['cwd config', path.join(cwd, 'config')],
        ['cwd .config', path.join(cwd, '.config')],
        [
            'home',
            path.join(process.env.USERPROFILE || process.env.HOME, 'config')
        ],
        [
            '.home',
            path.join(process.env.USERPROFILE || process.env.HOME, '.config')
        ],
        ['etc', '/etc/config/']
    ];
    if (confDir)
        lookuppaths.push(['jiggy custom override', confDir]);
    if (process.env.NODE_CONFIG_DIR)
        lookuppaths.push([
            'NODE_CONFIG_DIR custom override',
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
    process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
    delete require.cache[require.resolve('config')];
    let originalCErr;
    if (!strict) {
        originalCErr = console.error;
        console.error = function () { };
    }
    let oldConfigFolder = process.env.NODE_CONFIG_DIR;
    process.env.NODE_CONFIG_DIR = configFolder;
    let config = require('config');
    process.env.NODE_CONFIG_DIR = oldConfigFolder;
    if (!strict) {
        console.error = originalCErr;
    }
    return config;
}
function _findProjectRoot(path) { }
//# sourceMappingURL=loadConfig.js.map