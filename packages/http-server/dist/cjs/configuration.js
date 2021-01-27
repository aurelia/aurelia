"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServerConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const http_server_js_1 = require("./http-server.js");
const interfaces_js_1 = require("./interfaces.js");
const file_server_js_1 = require("./request-handlers/file-server.js");
const push_state_handler_js_1 = require("./request-handlers/push-state-handler.js");
const server_options_js_1 = require("./server-options.js");
const opts = new server_options_js_1.HttpServerOptions();
exports.HttpServerConfiguration = {
    create(customization) {
        opts.applyConfig(customization);
        opts.validate();
        return {
            register(container) {
                container.register(kernel_1.Registration.instance(interfaces_js_1.IHttpServerOptions, opts), kernel_1.Registration.singleton(interfaces_js_1.IRequestHandler, push_state_handler_js_1.PushStateHandler), kernel_1.Registration.singleton(interfaces_js_1.IRequestHandler, file_server_js_1.FileServer), kernel_1.Registration.singleton(interfaces_js_1.IHttp2FileServer, file_server_js_1.Http2FileServer), kernel_1.LoggerConfiguration.create({ sinks: [kernel_1.ConsoleSink], level: opts.level, colorOptions: 1 /* colors */ }), kernel_1.Registration.instance(kernel_1.IPlatform, new kernel_1.Platform(globalThis)));
                if (opts.useHttp2) {
                    container.register(kernel_1.Registration.singleton(interfaces_js_1.IHttpServer, http_server_js_1.Http2Server));
                }
                else {
                    container.register(kernel_1.Registration.singleton(interfaces_js_1.IHttpServer, http_server_js_1.HttpServer));
                }
                return container;
            },
        };
    }
};
//# sourceMappingURL=configuration.js.map