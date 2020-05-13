(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./http-server", "./interfaces", "./request-handlers/file-server", "./server-options"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const http_server_1 = require("./http-server");
    const interfaces_1 = require("./interfaces");
    const file_server_1 = require("./request-handlers/file-server");
    const server_options_1 = require("./server-options");
    const opts = new server_options_1.HttpServerOptions();
    exports.HttpServerConfiguration = {
        create(customization) {
            opts.applyConfig(customization);
            opts.validate();
            return {
                register(container) {
                    container.register(kernel_1.Registration.instance(interfaces_1.IHttpServerOptions, opts), kernel_1.Registration.singleton(interfaces_1.IRequestHandler, file_server_1.FileServer), kernel_1.Registration.singleton(interfaces_1.IHttp2FileServer, file_server_1.Http2FileServer), kernel_1.LoggerConfiguration.create(console, opts.level, 1 /* colors */));
                    if (opts.useHttp2) {
                        container.register(kernel_1.Registration.singleton(interfaces_1.IHttpServer, http_server_1.Http2Server));
                    }
                    else {
                        container.register(kernel_1.Registration.singleton(interfaces_1.IHttpServer, http_server_1.HttpServer));
                    }
                    return container;
                },
            };
        }
    };
});
//# sourceMappingURL=configuration.js.map