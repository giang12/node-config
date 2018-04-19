import { loadConfig } from "./loadConfig";

let conf = loadConfig(__dirname + "/test");

console.log(conf);

console.log(`${conf.get("name")}`); //only defined in production env

console.log(`env=${conf.has("transporter.nats") ? "production" : "dev"}`);

console.log(`transporter=${JSON.stringify(conf.get("transporter.nats"))}`); //only defined in production env

module.exports = conf;
