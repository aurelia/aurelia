(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./util", "./retry-interceptor", "./http-client-configuration", "./http-client"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpClient = exports.HttpClientConfiguration = exports.RetryInterceptor = exports.retryStrategy = exports.json = void 0;
    var util_1 = require("./util");
    Object.defineProperty(exports, "json", { enumerable: true, get: function () { return util_1.json; } });
    var retry_interceptor_1 = require("./retry-interceptor");
    Object.defineProperty(exports, "retryStrategy", { enumerable: true, get: function () { return retry_interceptor_1.retryStrategy; } });
    Object.defineProperty(exports, "RetryInterceptor", { enumerable: true, get: function () { return retry_interceptor_1.RetryInterceptor; } });
    var http_client_configuration_1 = require("./http-client-configuration");
    Object.defineProperty(exports, "HttpClientConfiguration", { enumerable: true, get: function () { return http_client_configuration_1.HttpClientConfiguration; } });
    var http_client_1 = require("./http-client");
    Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return http_client_1.HttpClient; } });
});
//# sourceMappingURL=index.js.map