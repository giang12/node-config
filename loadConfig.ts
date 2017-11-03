const nconf = require('nconf')
	, path = require('path')
	, fs = require('fs-extra')
	, Config = require('./index').Config;

import {defaults, merge} from 'lodash';

/**
 * Load Config Hierarchy
 * ordered by priority
 * 1. `config_path` 
 * 		defined by:
 * 		 	process.args (eg node run.js --config_path=path/to/configs)
 * 		or	process.env (eg config_path=path/to/config node run.js 
 * 						 ||
 * 						 export config_path=path/to/config 
 * 						 node run.js)
 * 2. specific environment (defined by NODE_ENV)
 * 3. default configs
 *
 * (2&3 are retrieved from `lookuppaths`)
 */

interface LoadConfOpts {
    verbose: boolean;
}

//We use the double underscore ( __ ) in place of the colon 
//because to specified it in the .env() call. 
//We do this because bash doesn't like periods or colons in environment vars, they already have meaning.
const NESTED_OBJECT_SEPARATOR = '__';
const DEFAULT_CONFIG_FILE_NAME = 'default';

/**
 * [loadConf description]
 * @param {string}       confDir (optional) [`absolute` path to lookup directory]
 * @param {LoadConfOpts} opts  (optional)  [opts]
 */
export function loadConfig(confDir?:string, opts?:LoadConfOpts ){

	let opt = defaults({}, opts, {
		verbose: false
	});

	let startup = nconf  
         .argv() 
         .env({separator: NESTED_OBJECT_SEPARATOR});

    //get runtime env
    let environment = (startup.get('NODE_ENV') || 'development').toLowerCase();

    // get a conf 
	let config_path = startup.get( 'config_path' );

	// purge the start up config 
	startup.remove('env');  
	startup.remove('argv');  
	startup.remove('defaults');  
	startup = null;

	//===============================================================================================================//
	let conf = new Config() //!important yo
            .overrides( { /* something that must always be this way */} ) 
			// Loads process.argv using yargs. If options is supplied it is passed along to yargs
            .argv()
			//Loads process.env into the hierarchy
            .env({separator: NESTED_OBJECT_SEPARATOR})


    //1. read in runtime conf defined @ config_path
    if(config_path) _readConf(conf, path.resolve(config_path));

    //2. look up environment & 3. default config
    let PROJECT_ROOT = confDir //absolute path
    					|| process.cwd(); //or where node is invoked

	// order matters, otherwise this could be an object
	// path @ index 0 has highest priority
	var lookuppaths =[
		['project', PROJECT_ROOT] // ./config.json
	 , ['.home', path.join(( process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT ), '.config') ] // .config/config.json
	 , ['home',path.join(( process.env.USERPROFILE || process.env.HOME || PROJECT_ROOT ), 'config') ] // config/config.json
	 , ['etc', "/etc/"]  // etc/config.json
	]


  	let defaultsConfig = {};
	// loop over paths and load them in 
	lookuppaths.forEach(function( lp ){

		let envFile = path.resolve(lp[1], `${environment}.json`);
		let defaultFile = path.resolve(lp[1], `${DEFAULT_CONFIG_FILE_NAME}.json`);
		let _defaultConf;

		conf = conf.file( lp[0], envFile); //load in environment file in each path if existed

	   	try{ 
      		_defaultConf = require(  defaultFile );
      		defaultsConfig = merge( defaultsConfig, _defaultConf );
   		} catch( e ){
      		if(opt.verbose) console.log('unable to load %s: %s', defaultFile, e.message );
   		}
  
	}); 

	conf.defaults(defaultsConfig);//default

	if(opt.verbose) console.log(conf.get());//print out everything

	return conf;
}


/**
 * merge configFile into conf 
 * this will modify conf
 * @param {[type]} conf       [description]
 * @param {[type]} configFile [description]
 */
function _readConf(conf, configFile){
	//console.log("reading from config_path", configFile);
	if(  fs.existsSync( configFile ) ){  
	   if( fs.statSync( configFile ).isDirectory() ){ 
	     // if it is a directory, read all json files 
	     fs
	        .readdirSync( configFile ) 
	        .filter( function( file ){ 
	           return (/\.json$/).test( file ); 
	        }) 
	        .sort( function( file_a, file_b ){ 
	           return file_a < file_b; 
	        }) 
	        .forEach( function( file ){ 
	           var filepath = path.normalize( path.join( configFile, file ) ); 
	           conf = conf.file( file, filepath ); 
	        })  
	   } else{ 
	    // if it is a file, read the file 
	    conf = conf.file( configFile ); 
	   } 
	}
}
