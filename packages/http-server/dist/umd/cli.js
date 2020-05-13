(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "fs", "path", "./server-options", "@aurelia/kernel", "./configuration", "./interfaces"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debug_1 = require("@aurelia/debug");
    const fs_1 = require("fs");
    const path_1 = require("path");
    const server_options_1 = require("./server-options");
    const kernel_1 = require("@aurelia/kernel");
    const configuration_1 = require("./configuration");
    const interfaces_1 = require("./interfaces");
    const cwd = process.cwd();
    function parseArgs(args) {
        const cmd = args[0];
        if (cmd === 'help') {
            return null;
        }
        const configuration = new server_options_1.HttpServerOptions();
        if (args.length % 2 === 1) {
            // check for configuration file
            const configurationFile = path_1.resolve(cwd, args[0]);
            if (!fs_1.existsSync(configurationFile)) {
                throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
                const config = require(configurationFile);
                configuration.applyConfig(config);
                args = args.slice(1);
            }
        }
        configuration.applyOptionsFromCli(cwd, args);
        return configuration;
    }
    (async function () {
        debug_1.DebugConfiguration.register();
        const parsed = parseArgs(process.argv.slice(2));
        if (parsed === null) {
            console.log(new server_options_1.HttpServerOptions().toString());
        }
        else {
            const container = kernel_1.DI.createContainer();
            container.register(configuration_1.HttpServerConfiguration.create(parsed));
            const server = container.get(interfaces_1.IHttpServer);
            await server.start();
        }
    })().catch(err => {
        console.error(err);
        process.exit(1);
    });
});
//# sourceMappingURL=cli.js.map