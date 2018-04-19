"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadConfig_1 = require("./loadConfig");
let conf = loadConfig_1.loadConfig(__dirname + "/test");
console.log(conf);
console.log(`${conf.get("name")}`);
console.log(`env=${conf.has("transporter.nats") ? "production" : "dev"}`);
console.log(`transporter=${JSON.stringify(conf.get("transporter.nats"))}`);
module.exports = conf;
//# sourceMappingURL=test.js.map