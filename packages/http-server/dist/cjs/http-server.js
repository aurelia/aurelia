"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Http2Server = exports.HttpServer = void 0;
const fs_1 = require("fs");
const http_1 = require("http");
const https = require("https");
const http2_1 = require("http2");
const kernel_1 = require("@aurelia/kernel");
const interfaces_js_1 = require("./interfaces.js");
const http_utils_js_1 = require("./http-utils.js");
const http_context_js_1 = require("./http-context.js");
let HttpServer = class HttpServer {
    constructor(logger, opts, container, handlers) {
        this.logger = logger;
        this.opts = opts;
        this.container = container;
        this.handlers = handlers;
        this.server = null;
        this.logger = logger.root.scopeTo('HttpServer');
    }
    async start() {
        this.logger.debug(`start()`);
        const { hostName, port, useHttps, key, cert } = this.opts;
        const server = this.server = (useHttps
            ? https.createServer({ key: fs_1.readFileSync(key), cert: fs_1.readFileSync(cert) }, this.handleRequest)
            : http_1.createServer(this.handleRequest)).listen(port, hostName);
        await new Promise(resolve => server.on('listening', resolve));
        const { address, port: realPort } = this.server.address();
        this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);
        return new interfaces_js_1.StartOutput(realPort);
    }
    async stop() {
        this.logger.debug(`stop()`);
        await new Promise(resolve => this.server.close(resolve));
    }
    async handleRequest(req, res) {
        this.logger.debug(`handleRequest(url=${req.url})`);
        try {
            const buffer = await http_utils_js_1.readBuffer(req);
            const context = new http_context_js_1.HttpContext(this.container, req, res, buffer);
            for (const handler of this.handlers) {
                // TODO: we need to identify here if the request is handled, if yes then break. Contextually, if the request is not handled by any handlers, we should panic, throw error and cause mayhem.
                // eslint-disable-next-line no-await-in-loop
                await handler.handleRequest(context);
            }
        }
        catch (err) {
            this.logger.error(`handleRequest Error: ${err.message}\n${err.stack}`);
            res.statusCode = 500 /* InternalServerError */;
            res.end();
        }
    }
};
__decorate([
    kernel_1.bound
], HttpServer.prototype, "handleRequest", null);
HttpServer = __decorate([
    __param(0, kernel_1.ILogger),
    __param(1, interfaces_js_1.IHttpServerOptions),
    __param(2, kernel_1.IContainer),
    __param(3, kernel_1.all(interfaces_js_1.IRequestHandler))
], HttpServer);
exports.HttpServer = HttpServer;
let Http2Server = class Http2Server {
    constructor(logger, opts, container, http2FileServer) {
        this.logger = logger;
        this.opts = opts;
        this.container = container;
        this.http2FileServer = http2FileServer;
        this.server = null;
        this.logger = logger.root.scopeTo('Http2Server');
    }
    async start() {
        this.logger.debug(`start()`);
        const { hostName, port, cert, key } = this.opts;
        const server = this.server = http2_1.createSecureServer({
            key: fs_1.readFileSync(key),
            cert: fs_1.readFileSync(cert)
        }, this.handleRequest // Do we need this at all?
        ).listen(port, hostName);
        await new Promise(resolve => server.on('listening', resolve));
        const { address, port: realPort } = server.address();
        this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);
        return new interfaces_js_1.StartOutput(realPort);
    }
    async stop() {
        this.logger.debug(`stop()`);
        await new Promise(resolve => this.server.close(resolve));
    }
    handleRequest(req, res) {
        this.logger.info(`handleRequest(url=${req.url})`);
        try {
            // const buffer = await readBuffer(req); // TODO handle this later
            const context = new http_context_js_1.HttpContext(this.container, req, res, null);
            this.http2FileServer.handleRequest(context);
        }
        catch (err) {
            this.logger.error(`handleRequest Error: ${err.message}\n${err.stack}`);
            res.statusCode = 500 /* InternalServerError */;
            res.end();
        }
    }
};
__decorate([
    kernel_1.bound
], Http2Server.prototype, "handleRequest", null);
Http2Server = __decorate([
    __param(0, kernel_1.ILogger),
    __param(1, interfaces_js_1.IHttpServerOptions),
    __param(2, kernel_1.IContainer),
    __param(3, interfaces_js_1.IHttp2FileServer)
], Http2Server);
exports.Http2Server = Http2Server;
//# sourceMappingURL=http-server.js.map