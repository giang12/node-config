const path = require("path"),
	callerId = require("caller-id");

import { defaults } from "lodash";

/**
 * Load Config Hierarchy
 * ordered by priority
 * 1. `NODE_CONFIG_DIR`
 * 	export NODE_CONFIG_DIR=path/to/config
 *  node run.js
 * 2. confDir
 * 3. specific environment (defined by NODE_ENV || NODE_CONFIG_ENV)
 * 4. default configs
 *
 * (2&3 are retrieved from `lookuppaths`)
 */

interface LoadConfOpts {
	verbose?: boolean;
	strict?: boolean;
}
/**
 * [loadConf description]
 * @param {string}       confDir (optional) [`absolute` path to lookup directory]
 * @param {LoadConfOpts} opts  (optional)  [opts]
 */
export function loadConfig(confDir?: string, opts?: LoadConfOpts) {
	let opt = defaults({}, opts, {
		verbose: false,
		strict: false
	});
	let caller = callerId.getData(loadConfig); //get ref to caller

	//1. read in conf defined @ caller directory as default
	let config = _loadConfig(path.dirname(caller.filePath), opt.strict);

	//2. look up environment & 3. system config
	let PROJECT_ROOT = process.cwd(); //of where node is invoked

	// order matters, otherwise this could be an object
	// !path @ index 0 has LOWEST priority
	let lookuppaths = [
		["etc", "/etc/config/"], // etc/config
		[
			"home",
			path.join(
				process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT,
				"config"
			)
		], // /Users/{username}/config/
		[
			".home",
			path.join(
				process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT,
				".config"
			)
		], // /Users/{username}/.config/
		["project config", path.join(PROJECT_ROOT, "config")], // ./config/
		["project .config", path.join(PROJECT_ROOT, ".config")], // ./.config/
		["project root", PROJECT_ROOT] // ./
	];

	if (confDir) lookuppaths.push(["custom override 1", confDir]);

	// loop over paths and load them in
	lookuppaths.forEach(lp => {
		config.util.extendDeep(config, config.util.loadFileConfigs(lp[1]));
	});

	if (opt.verbose) console.log(config); //print out everything
	return config;
}

function _loadConfig(configFolder, strict = false) {
	process.env.SUPPRESS_NO_CONFIG_WARNING = "y";
	delete require.cache[require.resolve("config")]; //forced isolation..
	let originalCErr;
	if (!strict) {
		originalCErr = console.error;
		console.error = function() {}; //surpress warning output
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
