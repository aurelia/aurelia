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
    var util_1 = require("./util");
    exports.json = util_1.json;
    var retry_interceptor_1 = require("./retry-interceptor");
    exports.retryStrategy = retry_interceptor_1.retryStrategy;
    exports.RetryInterceptor = retry_interceptor_1.RetryInterceptor;
    var http_client_configuration_1 = require("./http-client-configuration");
    exports.HttpClientConfiguration = http_client_configuration_1.HttpClientConfiguration;
    var http_client_1 = require("./http-client");
    exports.HttpClient = http_client_1.HttpClient;
});
//# sourceMappingURL=index.js.map