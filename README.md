# Configure your Node.js Applications

[![NPM](https://nodei.co/npm/my-nconf.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/my-nconf/)&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/giang12/node-config.svg?branch=master)](https://travis-ci.org/giang12/node-config)

## Introduction

my-nconf organizes hierarchical configurations for your app deployments.

It lets you define a set of default parameters,
and extend them for different deployment environments (development, qa, staging, production, etc.).

Configurations are stored in [configuration files](https://github.com/lorenwest/node-config/wiki/Configuration-Files) within your application, and can be overridden and extended by [environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables)

## Install:

```shell
$ npm i my-nconf -s
```

## Usage:

`config.get()` will throw an exception for undefined keys to help catch typos and missing values.

Use `config.has()` to test if a configuration value is defined.

Use configs in your code:

```js
//./app/server.js
import { loadConfig } from 'my-nconf';

var config = loadConfig();
var dbConfig = config.get('Customer.dbConfig');
db.connect(dbConfig, ...);

if (config.has('optionalFeature.detail')) {
  var detail = config.get('optionalFeature.detail');
  //...
}
```

By default `loadConfig` will load in config files found at `callsite` directory (e.g `./app/`)
then it will attempt to read and `extendDeep` appropriate config files found at `lookuppaths` in order

```
let lookuppaths = [
	 {callsite}/config
	,{callsite}/.config
	,{project dir}
	,{project dir}/config/
	,{project dir}/.config/
	,{cwd}
	,{cwd}/config/
	,{cwd}/.config/
	,/Users/{username}/config/
	,/Users/{username}/.config/
	,/etc/config
	,/etc/.config
	,/config
	,/.config
	,confDirs //e.g loadConfig(confDir) loadConfig([confDir1, dir2, dir3], opts)
	,process.env.NODE_CONFIG_DIR
];
```

## Start your app server:

```shell
$ export NODE_ENV=production
$ node ./app/server.js
```
