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
exports.IHttpServerOptions = kernel_1.DI.createInterface('IHttpServerOptions');
exports.IHttpServer = kernel_1.DI.createInterface('IHttpServer');
exports.IRequestHandler = kernel_1.DI.createInterface('IRequestHandler');
exports.IHttp2FileServer = kernel_1.DI.createInterface('IHttp2FileServer');
//# sourceMappingURL=interfaces.js.map