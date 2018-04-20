const path = require("path"),
	callerId = require("caller-id");
const pkgDir = require("pkg-dir");

import { defaults } from "lodash";

interface LoadConfOpts {
	verbose?: boolean;
	strict?: boolean;
}

/**
 * Load Config Hierarchy by extendDeep
 * @param {string}       confDir [custom overide config dir this will have 2nd highest priority, 1 below `NODE_CONFIG_DIR`]
 * @param {LoadConfOpts} opts    [options]
 */
export function loadConfig(confDir?: string, opts?: LoadConfOpts) {
	let opt = defaults({}, opts, {
		verbose: false,
		strict: false
	});

	//relevant dir paths
	const caller = callerId.getData(loadConfig), //get ref to caller of loadConfig
		CALLER_DIR = path.dirname(caller.filePath),
		PROJ_ROOT = pkgDir.sync(CALLER_DIR), //walk up till 1st occurance of package.json
		CWD = process.cwd(),
		HOME = process.env.USERPROFILE || process.env.HOME; //of where node is invoked

	if (opt.verbose) {
		console.log(caller);
		console.log(PROJ_ROOT);
	}
	//1. read in conf defined @ caller directory as default
	let config = _loadConfig(CALLER_DIR, opt.strict);

	//2. look up environment & 3. system config
	// order matters, otherwise this could be an object
	// !path @ index 0 has LOWEST priority, latest rule has Highest
	let lookuppaths = [
		["caller config", path.join(CALLER_DIR, "config")], // {callsite}/config
		["caller .config", path.join(CALLER_DIR, ".config")], // {callsite}/.config
		["project", PROJ_ROOT], // ./
		["project config", path.join(PROJ_ROOT, "config")], // ./config/
		["project .config", path.join(PROJ_ROOT, ".config")], // ./.config/
		["cwd", CWD], // ./
		["cwd config", path.join(CWD, "config")], // ./config/
		["cwd .config", path.join(CWD, ".config")], // ./.config/
		["home", path.join(HOME, "config")], // /Users/{username}/config/
		[".home", path.join(HOME, ".config")], // /Users/{username}/.config/
		["etc", "/etc/config/"] // etc/config
	];
	/** custom rules */
	if (confDir) lookuppaths.push(["jiggy custom override", confDir]);

	if (process.env.NODE_CONFIG_DIR)
		lookuppaths.push([
			"NODE_CONFIG_DIR custom override",
			process.env.NODE_CONFIG_DIR
		]);
	//	end custom rules
	//
	// loop over paths and load them in using extendDeep (replace array)
	lookuppaths.forEach(lp => {
		config.util.extendDeep(config, config.util.loadFileConfigs(lp[1]));
	});

	if (opt.verbose) console.log(config); //print out everything
	return config;
}

function _loadConfig(configFolder, strict?) {
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
