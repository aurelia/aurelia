(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IHttp2FileServer = exports.IRequestHandler = exports.IHttpServer = exports.IHttpServerOptions = exports.StartOutput = exports.Encoding = void 0;
    const kernel_1 = require("@aurelia/kernel");
    var Encoding;
    (function (Encoding) {
        Encoding["utf8"] = "utf8";
    })(Encoding = exports.Encoding || (exports.Encoding = {}));
    class StartOutput {
        constructor(realPort) {
            this.realPort = realPort;
        }
    }
    exports.StartOutput = StartOutput;
    exports.IHttpServerOptions = kernel_1.DI.createInterface('IHttpServerOptions').noDefault();
    exports.IHttpServer = kernel_1.DI.createInterface('IHttpServer').noDefault();
    exports.IRequestHandler = kernel_1.DI.createInterface('IRequestHandler').noDefault();
    exports.IHttp2FileServer = kernel_1.DI.createInterface('IHttp2FileServer').noDefault();
});
//# sourceMappingURL=interfaces.js.map