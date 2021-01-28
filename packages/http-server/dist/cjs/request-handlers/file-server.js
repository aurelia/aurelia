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
exports.Http2FileServer = exports.FileServer = void 0;
const fs_1 = require("fs");
const http_1 = require("http");
const http2_1 = require("http2");
const path_1 = require("path");
const kernel_1 = require("@aurelia/kernel");
const interfaces_js_1 = require("../interfaces.js");
const http_utils_js_1 = require("../http-utils.js");
const file_utils_js_1 = require("../file-utils.js");
const { HTTP2_HEADER_PATH, HTTP2_HEADER_CONTENT_LENGTH, HTTP2_HEADER_LAST_MODIFIED, HTTP2_HEADER_CONTENT_TYPE, HTTP2_HEADER_ACCEPT_ENCODING, HTTP2_HEADER_CONTENT_ENCODING, HTTP2_HEADER_CACHE_CONTROL } = http2_1.constants;
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
        this.root = path_1.resolve(opts.root);
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    async handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof http_1.IncomingMessage && response instanceof http_1.ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const path = path_1.join(this.root, parsedUrl.path);
        if (await file_utils_js_1.isReadable(path)) {
            this.logger.debug(`Serving file "${path}"`);
            const contentType = http_utils_js_1.getContentType(path);
            const clientEncoding = determineContentEncoding(context);
            let contentEncoding = (void 0);
            let content = (void 0);
            if (clientEncoding === 'br'
                || clientEncoding === 'gzip'
                || clientEncoding === 'compress') {
                const compressedFile = `${path}${contentEncodingExtensionMap[clientEncoding]}`;
                if (await file_utils_js_1.exists(compressedFile)) {
                    content = await file_utils_js_1.readFile(compressedFile);
                    contentEncoding = http_utils_js_1.getContentEncoding(compressedFile);
                }
            }
            // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
            if (contentEncoding === void 0 || content === void 0) {
                content = await file_utils_js_1.readFile(path);
                contentEncoding = http_utils_js_1.getContentEncoding(path);
            }
            response.writeHead(200 /* OK */, {
                'Content-Type': contentType,
                'Content-Encoding': contentEncoding,
                'Cache-Control': this.cacheControlDirective
            });
            await new Promise(function (resolve) {
                response.end(content, resolve);
            });
        }
        else {
            this.logger.debug(`File "${path}" could not be found`);
            response.writeHead(404 /* NotFound */);
            await new Promise(function (resolve) {
                response.end(resolve);
            });
        }
        context.state = 3 /* end */;
    }
};
FileServer = __decorate([
    __param(0, interfaces_js_1.IHttpServerOptions),
    __param(1, kernel_1.ILogger)
], FileServer);
exports.FileServer = FileServer;
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
        this.root = path_1.resolve(opts.root);
        this.prepare();
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof http2_1.Http2ServerRequest && response instanceof http2_1.Http2ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const parsedPath = parsedUrl.path;
        const path = path_1.join(this.root, parsedPath);
        const contentEncoding = determineContentEncoding(context);
        const file = this.getPushInfo(parsedPath, contentEncoding);
        if (file !== void 0) {
            this.logger.debug(`Serving file "${path}"`);
            const stream = response.stream;
            // TODO make this configurable
            if (parsedPath === '/index.html') {
                this.pushAll(stream, contentEncoding);
            }
            stream.respondWithFD(file.fd, file.headers);
        }
        else {
            this.logger.debug(`File "${path}" could not be found`);
            response.writeHead(404 /* NotFound */);
            response.end();
        }
        context.state = 3 /* end */;
    }
    pushAll(stream, contentEncoding) {
        for (const path of this.filePushMap.keys()) {
            if (!path.endsWith('index.html') && !compressedFileExtensions.has(path_1.extname(path))) {
                this.push(stream, path, this.getPushInfo(path, contentEncoding));
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
        for (const item of fs_1.readdirSync(root)) {
            const path = path_1.join(root, item);
            const stats = fs_1.statSync(path);
            if (stats.isFile()) {
                this.filePushMap.set(`/${path_1.relative(this.root, path)}`, PushInfo.create(path, cacheControlDirective));
            }
            else {
                this.prepare(path);
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
    __param(0, interfaces_js_1.IHttpServerOptions),
    __param(1, kernel_1.ILogger)
], Http2FileServer);
exports.Http2FileServer = Http2FileServer;
class PushInfo {
    constructor(fd, headers) {
        this.fd = fd;
        this.headers = headers;
    }
    static create(path, cacheControlDirective) {
        const stat = fs_1.statSync(path);
        return new PushInfo(fs_1.openSync(path, 'r'), {
            [HTTP2_HEADER_CONTENT_LENGTH]: stat.size,
            [HTTP2_HEADER_LAST_MODIFIED]: stat.mtime.toUTCString(),
            [HTTP2_HEADER_CONTENT_TYPE]: http_utils_js_1.getContentType(path),
            [HTTP2_HEADER_CONTENT_ENCODING]: http_utils_js_1.getContentEncoding(path),
            [HTTP2_HEADER_CACHE_CONTROL]: cacheControlDirective
        });
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
//# sourceMappingURL=file-server.js.map