"use strict";
const loadConfig = require('../index').loadConfig;
let conf = loadConfig(__dirname);
console.log(`env=${conf.has("transporter:nats") ? "production" : "dev"}`);
console.log(`transporter=${JSON.stringify(conf.get("transporter:nats"))}`);
module.exports = conf;
//# sourceMappingURL=index.js.map