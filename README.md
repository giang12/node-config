Configure your Node.js Applications
===================================

[![NPM](https://nodei.co/npm/my-nconf.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/my-nconf/)&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/giang12/node-config.svg?branch=master)](https://travis-ci.org/giang12/node-config)

Introduction
------------

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

## Start your app server:

```shell
$ export NODE_ENV=production
$ node my-app.js
```
