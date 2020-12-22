"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const kernel_1 = require("@aurelia/kernel");
const interfaces_js_1 = require("./system/interfaces.js");
const file_system_js_1 = require("./system/file-system.js");
const service_host_js_1 = require("./service-host.js");
(async function () {
    // Just for testing
    const root = path_1.resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');
    const container = kernel_1.DI.createContainer();
    container.register(kernel_1.LoggerConfiguration.create({ $console: console, level: 1 /* debug */, colorOptions: 1 /* colors */ }), kernel_1.Registration.singleton(interfaces_js_1.IFileSystem, file_system_js_1.NodeFileSystem));
    const host = new service_host_js_1.ServiceHost(container);
    await host.executeEntryFile(root);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=test.js.map