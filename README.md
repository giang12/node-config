Configure your Node.js Applications
===================================

Introduction
------------

node-config organizes hierarchical configurations for your app deployments.

It lets you define a set of default parameters,
and extend them for different deployment environments (development, qa, staging, production, etc.).

Configurations are stored in [configuration files](https://github.com/lorenwest/node-config/wiki/Configuration-Files) within your application, and can be overridden and extended by [environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables)


**Install:**

```shell
$ npm i my-nconf -s
```

**Usage**

`config.get()` will throw an exception for undefined keys to help catch typos and missing values.

Use `config.has()` to test if a configuration value is defined.

**Start your app server:**

```shell
$ export NODE_ENV=production
$ node my-app.js
```
