"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nconf = require('nconf'), path = require('path'), fs = require('fs-extra'), Config = require('./index').Config;
const lodash_1 = require("lodash");
const NESTED_OBJECT_SEPARATOR = '__';
const DEFAULT_CONFIG_FILE_NAME = 'default';
function loadConfig(confDir, opts) {
    let opt = lodash_1.defaults({}, opts, {
        verbose: false
    });
    let startup = nconf
        .argv()
        .env({ separator: NESTED_OBJECT_SEPARATOR });
    let environment = (startup.get('NODE_ENV') || 'development').toLowerCase();
    let config_path = startup.get('config_path');
    startup.remove('env');
    startup.remove('argv');
    startup.remove('defaults');
    startup = null;
    let conf = new Config()
        .overrides({})
        .argv()
        .env({ separator: NESTED_OBJECT_SEPARATOR });
    if (config_path)
        _readConf(conf, path.resolve(config_path));
    let PROJECT_ROOT = confDir
        || process.cwd();
    var lookuppaths = [
        ['project', PROJECT_ROOT],
        ['.home', path.join((process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT), '.config')],
        ['home', path.join((process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT), 'config')],
        ['etc', "/etc/"]
    ];
    let defaultsConfig = {};
    lookuppaths.forEach(function (lp) {
        let envFile = path.resolve(lp[1], `${environment}.json`);
        let defaultFile = path.resolve(lp[1], `${DEFAULT_CONFIG_FILE_NAME}.json`);
        let _defaultConf;
        conf = conf.file(lp[0], envFile);
        try {
            _defaultConf = require(defaultFile);
            defaultsConfig = lodash_1.merge(defaultsConfig, _defaultConf);
        }
        catch (e) {
            if (opt.verbose)
                console.log('unable to load %s: %s', defaultFile, e.message);
        }
    });
    conf.defaults(defaultsConfig);
    if (opt.verbose)
        console.log(conf.get());
    return conf;
}
exports.loadConfig = loadConfig;
function _readConf(conf, configFile) {
    if (fs.existsSync(configFile)) {
        if (fs.statSync(configFile).isDirectory()) {
            fs
                .readdirSync(configFile)
                .filter(function (file) {
                return (/\.json$/).test(file);
            })
                .sort(function (file_a, file_b) {
                return file_a < file_b;
            })
                .forEach(function (file) {
                var filepath = path.normalize(path.join(configFile, file));
                conf = conf.file(file, filepath);
            });
        }
        else {
            conf = conf.file(configFile);
        }
    }
}
//# sourceMappingURL=loadConfig.js.map