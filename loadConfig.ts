const path = require("path"),
	callerId = require("caller-id");
const pkgDir = require("pkg-dir"),
	readPkgUp = require("read-pkg-up");
import { defaults } from "lodash";

interface LoadConfOpts {
	verbose?: boolean;
	strict?: boolean;
}

/**
 * Load Config Hierarchy by extendDeep
 * @param {string}       confDirs [custom overide config dirs this will have 2nd highest priority, 1 below `NODE_CONFIG_DIR`]
 * @param {LoadConfOpts} opts    [options]
 */
export function loadConfig(confDirs?: any, opts?: LoadConfOpts) {
	process.env.ALLOW_CONFIG_MUTATIONS = "y"; //since we self manage the loading logic

	let opt = defaults({}, opts, {
		verbose: false,
		strict: false
	});

	confDirs = Array.isArray(confDirs)
		? confDirs
		: typeof confDirs === "string"
			? [confDirs]
			: [];
	const log = opt.verbose ? console.log : function() {};
	//relevant dir paths
	const caller = callerId.getData(loadConfig), //get ref to caller of loadConfig
		CALLER_DIR = path.dirname(caller.filePath),
		PROJ_ROOT = pkgDir.sync(CALLER_DIR), //walk up till 1st occurance of package.json
		PKG = readPkgUp.sync({ cwd: CALLER_DIR }).package,
		CWD = process.cwd(),
		HOME = process.env.USERPROFILE || process.env.HOME, //of where node is invoked
		ROOT = "/",
		NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR;

	log(caller);
	log(PROJ_ROOT);
	log("module name %s", PKG.name);
	//1. read in conf defined @ caller directory as default
	let config = _loadConfig(CALLER_DIR, opt.strict);

	//2. look up environment & 3. system config
	// order matters, otherwise this could be an object
	// !path @ index 0 has LOWEST priority, latest rule has Highest
	let lookuppaths = [
		["caller config", path.join(CALLER_DIR, "config")], // {callsite}/config
		["caller .config", path.join(CALLER_DIR, ".config")], // {callsite}/.config
		["caller config mod", path.join(CALLER_DIR, "config", PKG.name)], // {callsite}/config/PKG.name/
		["caller .config mod", path.join(CALLER_DIR, ".config", PKG.name)], // {callsite}/.config/PKG.name/

		["project", path.resolve(PROJ_ROOT)], // ./
		["project config", path.join(PROJ_ROOT, "config")], // ./config/
		["project .config", path.join(PROJ_ROOT, ".config")], // ./.config/
		["project configmod", path.join(PROJ_ROOT, "config", PKG.name)], // ./config/PKG.name/
		["project .config mod", path.join(PROJ_ROOT, ".config", PKG.name)], // ./config/PKG.name/

		["cwd", path.resolve(CWD)], // ./
		["cwd config", path.join(CWD, "config")], // ./config/
		["cwd .config", path.join(CWD, ".config")], // ./.config/
		["cwd config mod", path.join(CWD, "config", PKG.name)], // ./config/PKG.name/
		["cwd .config mod", path.join(CWD, ".config", PKG.name)], // ./.config/PKG.name/

		["home", path.join(HOME, "config")], // /Users/{username}/config/
		[".home", path.join(HOME, ".config")], // /Users/{username}/.config/
		["home mod", path.join(HOME, "config", PKG.name)], // /Users/{username}/config/PKG.name/
		[".home mod", path.join(HOME, ".config", PKG.name)], // /Users/{username}/.config/PKG.name/

		["etc", path.resolve("/etc/config/")], // etc/config/
		[".etc", path.resolve("/etc/.config/")], // etc/.config/
		["etc mod", path.join("/etc/", "config", PKG.name)], // etc/config/PKG.name/
		[".etc mod", path.join("/etc/", ".config", PKG.name)], // etc/.config/PKG.name/

		["root", path.join(ROOT, "config")], // /config
		[".root", path.join(ROOT, ".config")], // /.config
		["root mod", path.join(ROOT, "config", PKG.name)], // /config/PKG.name/
		[".root mod", path.join(ROOT, ".config", PKG.name)] // /.config/PKG.name/
	];
	/** custom rules */
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
	//	end custom rules
	//
	// loop over paths and load them in using extendDeep (replace array)
	lookuppaths.forEach(lp => {
		const c = config.util.loadFileConfigs(lp[1]);
		log(lp[0] + "@" + lp[1] + ": " + JSON.stringify(c, null, 2));
		config.util.extendDeep(config, c);
	});

	log(config); //print out everything
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
