import { DI } from '@aurelia/kernel';
export var Encoding;
(function (Encoding) {
    Encoding["utf8"] = "utf8";
})(Encoding || (Encoding = {}));
export class StartOutput {
    constructor(realPort) {
        this.realPort = realPort;
    }
}
export const IHttpServerOptions = DI.createInterface('IHttpServerOptions');
export const IHttpServer = DI.createInterface('IHttpServer');
export const IRequestHandler = DI.createInterface('IRequestHandler');
export const IHttp2FileServer = DI.createInterface('IHttp2FileServer');
//# sourceMappingURL=interfaces.js.map