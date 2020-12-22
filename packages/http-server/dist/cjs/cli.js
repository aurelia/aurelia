"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const server_options_js_1 = require("./server-options.js");
const kernel_1 = require("@aurelia/kernel");
const configuration_js_1 = require("./configuration.js");
const interfaces_js_1 = require("./interfaces.js");
const cwd = process.cwd();
async function parseArgs(args) {
    const cmd = args[0];
    if (cmd === 'help') {
        return null;
    }
    const configuration = new server_options_js_1.HttpServerOptions();
    if (args.length % 2 === 1) {
        // check for configuration file
        const configurationFile = path_1.resolve(cwd, args[0]);
        if (!fs_1.existsSync(configurationFile)) {
            throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
        }
        else {
            const config = (await Promise.resolve().then(() => require(`file://${configurationFile}`))).default;
            configuration.applyConfig(config);
            args = args.slice(1);
        }
    }
    configuration.applyOptionsFromCli(cwd, args);
    return configuration;
}
(async function () {
    const parsed = await parseArgs(process.argv.slice(2));
    if (parsed === null) {
        console.log(new server_options_js_1.HttpServerOptions().toString());
    }
    else {
        const container = kernel_1.DI.createContainer();
        container.register(configuration_js_1.HttpServerConfiguration.create(parsed));
        const server = container.get(interfaces_js_1.IHttpServer);
        await server.start();
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map