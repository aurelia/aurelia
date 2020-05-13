(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./request-handlers/file-server", "./configuration", "./http-context", "./http-server", "./http-utils", "./interfaces", "./path-utils", "./server-options"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var file_server_1 = require("./request-handlers/file-server");
    exports.FileServer = file_server_1.FileServer;
    var configuration_1 = require("./configuration");
    exports.RuntimeNodeConfiguration = configuration_1.HttpServerConfiguration;
    var http_context_1 = require("./http-context");
    exports.HttpContextState = http_context_1.HttpContextState;
    exports.HttpContext = http_context_1.HttpContext;
    var http_server_1 = require("./http-server");
    exports.HttpServer = http_server_1.HttpServer;
    var http_utils_1 = require("./http-utils");
    exports.HTTPStatusCode = http_utils_1.HTTPStatusCode;
    exports.ContentType = http_utils_1.ContentType;
    exports.HTTPError = http_utils_1.HTTPError;
    exports.readBuffer = http_utils_1.readBuffer;
    exports.getContentType = http_utils_1.getContentType;
    var interfaces_1 = require("./interfaces");
    exports.Encoding = interfaces_1.Encoding;
    exports.IHttpServer = interfaces_1.IHttpServer;
    exports.IHttpServerOptions = interfaces_1.IHttpServerOptions;
    exports.IRequestHandler = interfaces_1.IRequestHandler;
    var path_utils_1 = require("./path-utils");
    exports.joinPath = path_utils_1.joinPath;
    exports.resolvePath = path_utils_1.resolvePath;
    exports.normalizePath = path_utils_1.normalizePath;
    var server_options_1 = require("./server-options");
    exports.HttpServerOptions = server_options_1.HttpServerOptions;
});
//# sourceMappingURL=index.js.map