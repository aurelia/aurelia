'use strict';

var fs = require('fs');
var path = require('path');
var kernel = require('@aurelia/kernel');
var os = require('os');
var platform = require('@aurelia/platform');
var http = require('http');
var https = require('https');
var http2 = require('http2');
var $url = require('url');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var https__namespace = /*#__PURE__*/_interopNamespace(https);
var $url__namespace = /*#__PURE__*/_interopNamespace($url);

const space = ' ';
class HttpServerOptions {
    constructor(root = './public/', hostName = '0.0.0.0', port = 8080, useHttp2 = false, useHttps = false, key = undefined, cert = undefined, logLevel = 'info', responseCacheControl = 'max-age=3600') {
        this.root = root;
        this.hostName = hostName;
        this.port = port;
        this.useHttp2 = useHttp2;
        this.useHttps = useHttps;
        this.key = key;
        this.cert = cert;
        this.logLevel = logLevel;
        this.responseCacheControl = responseCacheControl;
    }
    applyConfig(config) {
        // non-nested object-tree is expected.
        for (const [key, value] of Object.entries(config)) {
            this[key] = value;
        }
    }
    /** @internal */
    validate() {
        const useHttp2 = this.useHttp2;
        const useHttps = this.useHttps;
        const key = this.key;
        const cert = this.cert;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if ((useHttp2 || useHttps) && !(key && cert)) { // boolean coercion is needed
            throw new Error(`key and cert are required for a HTTP/2 server`);
        }
    }
    toString(indent = '') {
        const l2Indent = `${indent}${space.repeat(2)}`;
        return `${indent}root${os.EOL}`
            + `${l2Indent}Description: The HTTP or HTTP/2 server serves the files from this directory${os.EOL}`
            + `${l2Indent}Value: ${this.root}${os.EOL}`
            + `${indent}hostName${os.EOL}`
            + `${l2Indent}Description: The host-name to be used${os.EOL}`
            + `${l2Indent}Value: ${this.hostName}${os.EOL}`
            + `${indent}port${os.EOL}`
            + `${l2Indent}Description: The port to be used${os.EOL}`
            + `${l2Indent}Value: ${this.port}${os.EOL}`
            + `${indent}useHttp2${os.EOL}`
            + `${l2Indent}Description: Whether to use HTTP/2 or not${os.EOL}`
            + `${l2Indent}Value: ${this.useHttp2}${os.EOL}`
            + `${indent}useHttps${os.EOL}`
            + `${l2Indent}Description: Whether to use SSL or not${os.EOL}`
            + `${l2Indent}Value: ${this.useHttps}${os.EOL}`
            + `${indent}key${os.EOL}`
            + `${l2Indent}Description: Optional path to the key file; required for https:// and HTTP/2${os.EOL}`
            + `${l2Indent}Value: ${this.key}${os.EOL}`
            + `${indent}cert${os.EOL}`
            + `${l2Indent}Description: Optional path to the certificate file; required for https:// and HTTP/2${os.EOL}`
            + `${l2Indent}Value: ${this.cert}${os.EOL}`
            + `${indent}logLevel${os.EOL}`
            + `${l2Indent}Description: Log level used by the HTTP server${os.EOL}`
            + `${l2Indent}Value: ${this.logLevel}${os.EOL}`;
    }
    get level() {
        const logLevel = this.logLevel;
        if (typeof logLevel === 'number') {
            return logLevel;
        }
        switch (logLevel) {
            case 'trace': return kernel.LogLevel.trace;
            case 'debug': return kernel.LogLevel.debug;
            case 'info': return kernel.LogLevel.info;
            case 'warn': return kernel.LogLevel.warn;
            case 'error': return kernel.LogLevel.error;
            case 'fatal': return kernel.LogLevel.fatal;
            case 'none': return kernel.LogLevel.none;
        }
    }
    applyOptionsFromCli(cwd, args, argPrefix = '') {
        const unconsumedArgs = [];
        while (args.length > 0) {
            const key = args[0].trim().replace(/-/g, '');
            const value = args[1];
            switch (key) {
                case `${argPrefix}root`:
                    this.root = path.resolve(cwd, value);
                    break;
                case `${argPrefix}hostName`:
                    this.hostName = value;
                    break;
                case `${argPrefix}port`:
                    this.port = Number(value);
                    break;
                case `${argPrefix}key`:
                    this.key = path.resolve(cwd, value);
                    break;
                case `${argPrefix}cert`:
                    this.cert = path.resolve(cwd, value);
                    break;
                case `${argPrefix}useHttp2`:
                    this.useHttp2 = value === 'true';
                    break;
                case `${argPrefix}logLevel`:
                    this.logLevel = value;
                    break;
                case `${argPrefix}responseCacheControl`:
                    this.responseCacheControl = value;
                    break;
                default:
                    unconsumedArgs.push(key, value);
                    break;
            }
            args.splice(0, 2);
        }
        if (unconsumedArgs.length > 0) {
            console.warn(`Following arguments are not consumed ${unconsumedArgs.join(',')}`);
        }
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

class StartOutput {
    constructor(realPort) {
        this.realPort = realPort;
    }
}
const IHttpServerOptions = kernel.DI.createInterface('IHttpServerOptions');
const IHttpServer = kernel.DI.createInterface('IHttpServer');
const IRequestHandler = kernel.DI.createInterface('IRequestHandler');
const IHttp2FileServer = kernel.DI.createInterface('IHttp2FileServer');

var HTTPStatusCode;
(function (HTTPStatusCode) {
    HTTPStatusCode[HTTPStatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    HTTPStatusCode[HTTPStatusCode["OK"] = 200] = "OK";
    HTTPStatusCode[HTTPStatusCode["Accepted"] = 202] = "Accepted";
    HTTPStatusCode[HTTPStatusCode["NoContent"] = 204] = "NoContent";
    HTTPStatusCode[HTTPStatusCode["Found"] = 302] = "Found";
    HTTPStatusCode[HTTPStatusCode["BadRequest"] = 400] = "BadRequest";
    HTTPStatusCode[HTTPStatusCode["Unauthorized"] = 401] = "Unauthorized";
    HTTPStatusCode[HTTPStatusCode["Forbidden"] = 403] = "Forbidden";
    HTTPStatusCode[HTTPStatusCode["NotFound"] = 404] = "NotFound";
    HTTPStatusCode[HTTPStatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HTTPStatusCode[HTTPStatusCode["InternalServerError"] = 500] = "InternalServerError";
    HTTPStatusCode[HTTPStatusCode["BadGateway"] = 502] = "BadGateway";
    HTTPStatusCode[HTTPStatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HTTPStatusCode[HTTPStatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HTTPStatusCode || (HTTPStatusCode = {}));
async function readBuffer(req) {
    let totalLength = 0;
    const chunks = [];
    req.on('data', function (chunk) {
        chunks.push(chunk);
        totalLength += chunk.length;
    });
    return new Promise(function (resolve, reject) {
        req.on('end', function () {
            const buffer = Buffer.concat(chunks, totalLength);
            resolve(buffer);
        });
        req.on('error', reject);
    });
}
function getContentType(path) {
    const i = path.lastIndexOf('.');
    if (i >= 0) {
        switch (path.slice(i)) {
            case '.js': return 'application/javascript; charset=utf-8';
            case '.css': return 'text/css; charset=utf-8';
            case '.json': return 'application/json; charset=utf-8';
            case '.html': return 'text/html; charset=utf-8';
        }
    }
    return 'text/plain; charset=utf-8';
}
function getContentEncoding(path) {
    const i = path.lastIndexOf('.');
    if (i >= 0) {
        switch (path.slice(i)) {
            case '.br': return 'br';
            case '.gz': return 'gzip';
            case '.lzw': return 'compress';
        }
    }
    return 'identity';
}
const wildcardHeaderValue = {
    [http2.constants.HTTP2_HEADER_ACCEPT_ENCODING]: '*',
    [http2.constants.HTTP2_HEADER_ACCEPT]: '*/*',
    [http2.constants.HTTP2_HEADER_ACCEPT_CHARSET]: '*',
    [http2.constants.HTTP2_HEADER_ACCEPT_LANGUAGE]: '*',
};
class QualifiedHeaderValues {
    constructor(headerName, headers) {
        var _a;
        this.headerName = headerName.toLowerCase();
        const rawValue = ((_a = headers[headerName]) !== null && _a !== void 0 ? _a : headers[this.headerName]);
        headerName = this.headerName;
        const parsedMap = this.parsedMap = new Map();
        if (rawValue === void 0) {
            const wildcardValue = wildcardHeaderValue[headerName];
            if (wildcardValue !== void 0) {
                parsedMap.set(wildcardValue, 1);
            }
            return;
        }
        // TODO handle the partial values such as `text/html;q=0.8,text/*;q=0.8,*/*;q=0.8`, `*`, or `*;q=0.8`
        /**
         * Example:
         * Header-Name: value1
         * Header-Name: value1, value2, value3
         * Header-Name: value1, value2;q=[0-1], value3;q=[0-1]
         */
        for (const item of rawValue.split(',')) {
            // TODO validate the `value` against a set of acceptable values.
            const [value, ...rest] = item.trim().split(';');
            let qValue = 1;
            const q = rest.find((x) => x.startsWith('q='));
            if (q !== void 0) {
                const rawQValue = q.substring(2);
                qValue = Number(rawQValue);
                if (Number.isNaN(qValue) || qValue < 0 || qValue > 1) {
                    throw new Error(`Invalid qValue ${rawQValue} for ${value} in ${headerName} header; raw values: ${rawValue}`);
                }
            }
            parsedMap.set(value, qValue);
            if (this.mostPrioritized === void 0 || this.mostPrioritized.q < qValue) {
                this.mostPrioritized = { name: value, q: qValue };
            }
        }
    }
    isAccepted(value) {
        const qValue = this.parsedMap.get(value);
        if (qValue !== void 0) {
            return qValue !== 0;
        }
        return this.parsedMap.has(wildcardHeaderValue[this.headerName]);
    }
    getQValueFor(value) {
        const qValue = this.parsedMap.get(value);
        return qValue !== null && qValue !== void 0 ? qValue : 0;
    }
}

class HttpContext {
    constructor(container, request, response, requestBuffer) {
        this.request = request;
        this.response = response;
        this.requestBuffer = requestBuffer;
        this.state = 'head';
        this.parsedHeaders = Object.create(null);
        this.rewrittenUrl = null;
        this.container = container.createChild();
        this._requestUrl = $url__namespace.parse(request.url);
    }
    getQualifiedRequestHeaderFor(headerName) {
        var _a;
        return (_a = this.parsedHeaders[headerName]) !== null && _a !== void 0 ? _a : (this.parsedHeaders[headerName] = new QualifiedHeaderValues(headerName, this.request.headers));
    }
    rewriteRequestUrl(url) {
        this.rewrittenUrl = $url__namespace.parse(url);
    }
    get requestUrl() {
        var _a;
        return (_a = this.rewrittenUrl) !== null && _a !== void 0 ? _a : this._requestUrl;
    }
}

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
            ? https__namespace.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, this.handleRequest)
            : http.createServer(this.handleRequest)).listen(port, hostName);
        await new Promise(resolve => server.on('listening', resolve));
        const { address, port: realPort } = this.server.address();
        this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);
        return new StartOutput(realPort);
    }
    async stop() {
        this.logger.debug(`stop()`);
        await new Promise(resolve => this.server.close(resolve));
    }
    async handleRequest(req, res) {
        this.logger.debug(`handleRequest(url=${req.url})`);
        try {
            const buffer = await readBuffer(req);
            const context = new HttpContext(this.container, req, res, buffer);
            for (const handler of this.handlers) {
                // TODO: we need to identify here if the request is handled, if yes then break. Contextually, if the request is not handled by any handlers, we should panic, throw error and cause mayhem.
                // eslint-disable-next-line no-await-in-loop
                await handler.handleRequest(context);
            }
        }
        catch (err) {
            this.logger.error(`handleRequest Error: ${err.message}\n${err.stack}`);
            res.statusCode = HTTPStatusCode.InternalServerError;
            res.end();
        }
    }
};
__decorate([
    kernel.bound
], HttpServer.prototype, "handleRequest", null);
HttpServer = __decorate([
    __param(0, kernel.ILogger),
    __param(1, IHttpServerOptions),
    __param(2, kernel.IContainer),
    __param(3, kernel.all(IRequestHandler))
], HttpServer);
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
        const server = this.server = http2.createSecureServer({
            key: fs.readFileSync(key),
            cert: fs.readFileSync(cert)
        }, this.handleRequest // Do we need this at all?
        ).listen(port, hostName);
        await new Promise(resolve => server.on('listening', resolve));
        const { address, port: realPort } = server.address();
        this.logger.info(`Now listening on ${address}:${realPort} (configured: ${hostName}:${port})`);
        return new StartOutput(realPort);
    }
    async stop() {
        this.logger.debug(`stop()`);
        await new Promise(resolve => this.server.close(resolve));
    }
    handleRequest(req, res) {
        this.logger.info(`handleRequest(url=${req.url})`);
        try {
            // const buffer = await readBuffer(req); // TODO handle this later
            const context = new HttpContext(this.container, req, res, null);
            this.http2FileServer.handleRequest(context);
        }
        catch (err) {
            this.logger.error(`handleRequest Error: ${err.message}\n${err.stack}`);
            res.statusCode = HTTPStatusCode.InternalServerError;
            res.end();
        }
    }
};
__decorate([
    kernel.bound
], Http2Server.prototype, "handleRequest", null);
Http2Server = __decorate([
    __param(0, kernel.ILogger),
    __param(1, IHttpServerOptions),
    __param(2, kernel.IContainer),
    __param(3, IHttp2FileServer)
], Http2Server);

async function readFile(path, options) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, options, function (err, data) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
async function isReadable(path) {
    return new Promise(function (resolve) {
        fs.access(path, fs.constants.F_OK, (err) => {
            resolve(err === null);
        });
    });
}
async function exists(path) {
    return new Promise(res => { fs.exists(path, res); });
}

const { HTTP2_HEADER_PATH, HTTP2_HEADER_CONTENT_LENGTH, HTTP2_HEADER_LAST_MODIFIED, HTTP2_HEADER_CONTENT_TYPE, HTTP2_HEADER_ACCEPT_ENCODING, HTTP2_HEADER_CONTENT_ENCODING, HTTP2_HEADER_CACHE_CONTROL } = http2.constants;
const contentEncodingExtensionMap = {
    br: '.br',
    gzip: '.gz',
    compress: '.lzw'
};
const compressedFileExtensions = new Set(Object.values(contentEncodingExtensionMap));
let FileServer = class FileServer {
    constructor(opts, logger) {
        var _a;
        this.opts = opts;
        this.logger = logger;
        this.cacheControlDirective = (_a = this.opts.responseCacheControl) !== null && _a !== void 0 ? _a : 'max-age=3600';
        this.logger = logger.root.scopeTo('FileServer');
        this.root = path.resolve(opts.root);
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    async handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof http.IncomingMessage && response instanceof http.ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const path$1 = path.join(this.root, parsedUrl.path);
        if (await isReadable(path$1)) {
            this.logger.debug(`Serving file "${path$1}"`);
            const contentType = getContentType(path$1);
            const clientEncoding = determineContentEncoding(context);
            let contentEncoding = (void 0);
            let content = (void 0);
            if (clientEncoding === 'br'
                || clientEncoding === 'gzip'
                || clientEncoding === 'compress') {
                const compressedFile = `${path$1}${contentEncodingExtensionMap[clientEncoding]}`;
                if (await exists(compressedFile)) {
                    content = await readFile(compressedFile);
                    contentEncoding = getContentEncoding(compressedFile);
                }
            }
            // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
            if (contentEncoding === void 0 || content === void 0) {
                content = await readFile(path$1);
                contentEncoding = getContentEncoding(path$1);
            }
            response.writeHead(HTTPStatusCode.OK, {
                'Content-Type': contentType,
                'Content-Encoding': contentEncoding,
                'Cache-Control': this.cacheControlDirective
            });
            await new Promise(function (resolve) {
                response.end(content, resolve);
            });
        }
        else {
            this.logger.debug(`File "${path$1}" could not be found`);
            response.writeHead(HTTPStatusCode.NotFound);
            await new Promise(function (resolve) {
                response.end(resolve);
            });
        }
        context.state = 'end';
    }
};
FileServer = __decorate([
    __param(0, IHttpServerOptions),
    __param(1, kernel.ILogger)
], FileServer);
/**
 * File server with HTTP/2 push support
 */
let Http2FileServer = class Http2FileServer {
    constructor(opts, logger) {
        var _a;
        this.opts = opts;
        this.logger = logger;
        this.filePushMap = new Map();
        this.cacheControlDirective = (_a = this.opts.responseCacheControl) !== null && _a !== void 0 ? _a : 'max-age=3600';
        this.logger = logger.root.scopeTo('Http2FileServer');
        this.root = path.resolve(opts.root);
        this.prepare();
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof http2.Http2ServerRequest && response instanceof http2.Http2ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const parsedPath = parsedUrl.path;
        const path$1 = path.join(this.root, parsedPath);
        const contentEncoding = determineContentEncoding(context);
        const file = this.getPushInfo(parsedPath, contentEncoding);
        if (file !== void 0) {
            this.logger.debug(`Serving file "${path$1}"`);
            const stream = response.stream;
            // TODO make this configurable
            if (parsedPath === '/index.html') {
                this.pushAll(stream, contentEncoding);
            }
            stream.respondWithFD(file.fd, file.headers);
        }
        else {
            this.logger.debug(`File "${path$1}" could not be found`);
            response.writeHead(HTTPStatusCode.NotFound);
            response.end();
        }
        context.state = 'end';
    }
    pushAll(stream, contentEncoding) {
        for (const path$1 of this.filePushMap.keys()) {
            if (!path$1.endsWith('index.html') && !compressedFileExtensions.has(path.extname(path$1))) {
                this.push(stream, path$1, this.getPushInfo(path$1, contentEncoding));
            }
        }
    }
    push(stream, filePath, { fd, headers }) {
        const pushHeaders = { [HTTP2_HEADER_PATH]: filePath };
        stream.pushStream(pushHeaders, (_err, pushStream) => {
            // TODO handle error
            this.logger.debug(`pushing ${filePath}`);
            pushStream.respondWithFD(fd, headers);
        });
    }
    prepare(root = this.opts.root) {
        const cacheControlDirective = this.cacheControlDirective;
        for (const item of fs.readdirSync(root)) {
            const path$1 = path.join(root, item);
            const stats = fs.statSync(path$1);
            if (stats.isFile()) {
                this.filePushMap.set(`/${path.relative(this.root, path$1)}`, PushInfo.create(path$1, cacheControlDirective));
            }
            else {
                this.prepare(path$1);
            }
        }
    }
    getPushInfo(path, contentEncoding) {
        if (contentEncoding === 'br'
            || contentEncoding === 'gzip'
            || contentEncoding === 'compress') {
            const info = this.filePushMap.get(`${path}${contentEncodingExtensionMap[contentEncoding]}`);
            if (info !== void 0) {
                return info;
            }
        }
        // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
        return this.filePushMap.get(path);
    }
};
Http2FileServer = __decorate([
    __param(0, IHttpServerOptions),
    __param(1, kernel.ILogger)
], Http2FileServer);
class PushInfo {
    static create(path, cacheControlDirective) {
        const stat = fs.statSync(path);
        return new PushInfo(fs.openSync(path, 'r'), {
            [HTTP2_HEADER_CONTENT_LENGTH]: stat.size,
            [HTTP2_HEADER_LAST_MODIFIED]: stat.mtime.toUTCString(),
            [HTTP2_HEADER_CONTENT_TYPE]: getContentType(path),
            [HTTP2_HEADER_CONTENT_ENCODING]: getContentEncoding(path),
            [HTTP2_HEADER_CACHE_CONTROL]: cacheControlDirective
        });
    }
    constructor(fd, headers) {
        this.fd = fd;
        this.headers = headers;
    }
}
function determineContentEncoding(context) {
    var _a, _b;
    const clientEncoding = context.getQualifiedRequestHeaderFor(HTTP2_HEADER_ACCEPT_ENCODING);
    // if brotli compression is supported return `br`
    if (clientEncoding.isAccepted('br')) {
        return 'br';
    }
    // else return the highest prioritized content
    return (_b = (_a = clientEncoding.mostPrioritized) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'identity';
}

class PushStateHandler {
    async handleRequest(context) {
        const request = context.request;
        const url = context.requestUrl.href;
        /**
         * Ignore the request if one of the following is condition holds:
         * 1. Not a GET request.
         * 2. Client does not accept html.
         * 3. The path has a dot (.) in the last fragment; dot rule.
         */
        if (request.method !== 'GET'
            || !context.getQualifiedRequestHeaderFor(http2.constants.HTTP2_HEADER_ACCEPT).isAccepted('text/html')
            || url.lastIndexOf('.') > url.lastIndexOf('/')) {
            return;
        }
        context.rewriteRequestUrl('/index.html');
    }
}

const opts = new HttpServerOptions();
const HttpServerConfiguration = {
    create(customization) {
        opts.applyConfig(customization);
        opts.validate();
        return {
            register(container) {
                container.register(kernel.Registration.instance(IHttpServerOptions, opts), kernel.Registration.singleton(IRequestHandler, PushStateHandler), kernel.Registration.singleton(IRequestHandler, FileServer), kernel.Registration.singleton(IHttp2FileServer, Http2FileServer), kernel.LoggerConfiguration.create({ sinks: [kernel.ConsoleSink], level: opts.level, colorOptions: 'colors' }), kernel.Registration.instance(kernel.IPlatform, new platform.Platform(globalThis)));
                if (opts.useHttp2) {
                    container.register(kernel.Registration.singleton(IHttpServer, Http2Server));
                }
                else {
                    container.register(kernel.Registration.singleton(IHttpServer, HttpServer));
                }
                return container;
            },
        };
    }
};

const cwd = process.cwd();
async function parseArgs(args) {
    const cmd = args[0];
    if (cmd === 'help') {
        return null;
    }
    const configuration = new HttpServerOptions();
    if (args.length % 2 === 1) {
        // check for configuration file
        const configurationFile = path.resolve(cwd, args[0]);
        if (!fs.existsSync(configurationFile)) {
            throw new Error(`Configuration file is missing or uneven amount of args: ${args}. Args must come in pairs of --key value`);
        }
        else {
            let config;
            try {
                config = (await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(`${configurationFile}`)).default;
            }
            catch (_a) {
                try {
                    config = (await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(`file://${configurationFile}`)).default;
                }
                catch (_b) {
                    try {
                        config = (await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(`file:///${configurationFile}`)).default;
                    }
                    catch ( /*  */_c) { /*  */ }
                }
            }
            if (config === void 0) {
                throw new Error('Unable to load configuration');
            }
            configuration.applyConfig(config);
            args = args.slice(1);
        }
    }
    configuration.applyOptionsFromCli(cwd, args);
    return configuration;
}
(async function () {
    const parsed = await parseArgs(process.argv.slice(2));
    if (parsed === null) {
        console.log(new HttpServerOptions().toString());
    }
    else {
        const container = kernel.DI.createContainer();
        container.register(HttpServerConfiguration.create(parsed));
        const server = container.get(IHttpServer);
        await server.start();
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cli.cjs.map
