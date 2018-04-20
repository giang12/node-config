const path = require('path'),
	callerId = require('caller-id');
const pkgDir = require('pkg-dir');

import { defaults } from 'lodash';

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

	//relevant dir paths
	let caller = callerId.getData(loadConfig),
		callerDir = path.dirname(caller.filePath), //get ref to caller
		projectRoot = pkgDir.sync(callerDir),
		cwd = process.cwd(); //of where node is invoked
	
	if(opt.verbose){
		console.log(caller);
		console.log(projectRoot);
	}
	//1. read in conf defined @ caller directory as default
	let config = _loadConfig(callerDir, opt.strict);

	//2. look up environment & 3. system config
	// order matters, otherwise this could be an object
	// !path @ index 0 has LOWEST priority, latest rule has Highest
	let lookuppaths = [
		['caller config', path.join(callerDir, 'config')], // {callsite}/config
		['caller .config', path.join(callerDir, '.config')], // {callsite}/.config
		['project root', projectRoot], // ./
		['project config', path.join(projectRoot, 'config')], // ./config/
		['project .config', path.join(projectRoot, '.config')], // ./.config/
		['cwd root', cwd], // ./
		['cwd config', path.join(cwd, 'config')], // ./config/
		['cwd .config', path.join(cwd, '.config')], // ./.config/
		[
			'home',
			path.join(process.env.USERPROFILE || process.env.HOME, 'config')
		], // /Users/{username}/config/
		[
			'.home',
			path.join(process.env.USERPROFILE || process.env.HOME, '.config')
		], // /Users/{username}/.config/
		['etc', '/etc/config/'] // etc/config
	];
	/** custom rules */
	if (confDir) lookuppaths.push(['jiggy custom override', confDir]);

	if (process.env.NODE_CONFIG_DIR)
		lookuppaths.push([
			'NODE_CONFIG_DIR custom override',
			process.env.NODE_CONFIG_DIR
		]);
	//	end custom rules
	//
	// loop over paths and load them in
	lookuppaths.forEach(lp => {
		config.util.extendDeep(config, config.util.loadFileConfigs(lp[1]));
	});

	if (opt.verbose) console.log(config); //print out everything
	return config;
}

function _loadConfig(configFolder, strict?) {
	process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
	delete require.cache[require.resolve('config')]; //forced isolation..
	let originalCErr;
	if (!strict) {
		originalCErr = console.error;
		console.error = function() {}; //surpress warning output
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

function _findProjectRoot(path) {}