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
    Object.defineProperty(exports, "FileServer", { enumerable: true, get: function () { return file_server_1.FileServer; } });
    var configuration_1 = require("./configuration");
    Object.defineProperty(exports, "RuntimeNodeConfiguration", { enumerable: true, get: function () { return configuration_1.HttpServerConfiguration; } });
    var http_context_1 = require("./http-context");
    Object.defineProperty(exports, "HttpContextState", { enumerable: true, get: function () { return http_context_1.HttpContextState; } });
    Object.defineProperty(exports, "HttpContext", { enumerable: true, get: function () { return http_context_1.HttpContext; } });
    var http_server_1 = require("./http-server");
    Object.defineProperty(exports, "HttpServer", { enumerable: true, get: function () { return http_server_1.HttpServer; } });
    var http_utils_1 = require("./http-utils");
    Object.defineProperty(exports, "HTTPStatusCode", { enumerable: true, get: function () { return http_utils_1.HTTPStatusCode; } });
    Object.defineProperty(exports, "ContentType", { enumerable: true, get: function () { return http_utils_1.ContentType; } });
    Object.defineProperty(exports, "HTTPError", { enumerable: true, get: function () { return http_utils_1.HTTPError; } });
    Object.defineProperty(exports, "readBuffer", { enumerable: true, get: function () { return http_utils_1.readBuffer; } });
    Object.defineProperty(exports, "getContentType", { enumerable: true, get: function () { return http_utils_1.getContentType; } });
    var interfaces_1 = require("./interfaces");
    Object.defineProperty(exports, "Encoding", { enumerable: true, get: function () { return interfaces_1.Encoding; } });
    Object.defineProperty(exports, "IHttpServer", { enumerable: true, get: function () { return interfaces_1.IHttpServer; } });
    Object.defineProperty(exports, "IHttpServerOptions", { enumerable: true, get: function () { return interfaces_1.IHttpServerOptions; } });
    Object.defineProperty(exports, "IRequestHandler", { enumerable: true, get: function () { return interfaces_1.IRequestHandler; } });
    var path_utils_1 = require("./path-utils");
    Object.defineProperty(exports, "joinPath", { enumerable: true, get: function () { return path_utils_1.joinPath; } });
    Object.defineProperty(exports, "resolvePath", { enumerable: true, get: function () { return path_utils_1.resolvePath; } });
    Object.defineProperty(exports, "normalizePath", { enumerable: true, get: function () { return path_utils_1.normalizePath; } });
    var server_options_1 = require("./server-options");
    Object.defineProperty(exports, "HttpServerOptions", { enumerable: true, get: function () { return server_options_1.HttpServerOptions; } });
});
//# sourceMappingURL=index.js.map