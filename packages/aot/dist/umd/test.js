(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "path", "@aurelia/kernel", "./system/interfaces", "./system/file-system", "./service-host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable import/no-nodejs-modules */
    const debug_1 = require("@aurelia/debug");
    const path_1 = require("path");
    const kernel_1 = require("@aurelia/kernel");
    const interfaces_1 = require("./system/interfaces");
    const file_system_1 = require("./system/file-system");
    const service_host_1 = require("./service-host");
    (async function () {
        debug_1.DebugConfiguration.register();
        // Just for testing
        const root = path_1.resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');
        const container = kernel_1.DI.createContainer();
        container.register(kernel_1.LoggerConfiguration.create({ $console: console, level: 1 /* debug */, colorOptions: 1 /* colors */ }), kernel_1.Registration.singleton(interfaces_1.IFileSystem, file_system_1.NodeFileSystem));
        const host = new service_host_1.ServiceHost(container);
        await host.executeEntryFile(root);
    })().catch(err => {
        console.error(err);
        process.exit(1);
    });
});
//# sourceMappingURL=test.js.map