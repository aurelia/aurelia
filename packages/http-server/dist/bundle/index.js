import { access, constants as constants$1, exists as exists$1, readFile as readFile$1, readdirSync, statSync, openSync, readFileSync } from 'fs';
import { IncomingMessage, ServerResponse, createServer } from 'http';
import { constants, Http2ServerRequest, Http2ServerResponse, createSecureServer } from 'http2';
import { resolve, join, extname, relative } from 'path';
import { DI, ILogger, bound, IContainer, all, Registration, LoggerConfiguration, ConsoleSink, IPlatform, Platform } from '@aurelia/kernel';
import * as https from 'https';
import { EOL } from 'os';

/*! *****************************************************************************
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

var Encoding;
(function (Encoding) {
    Encoding["utf8"] = "utf8";
})(Encoding || (Encoding = {}));
class StartOutput {
    constructor(realPort) {
        this.realPort = realPort;
    }
}
const IHttpServerOptions = DI.createInterface('IHttpServerOptions');
const IHttpServer = DI.createInterface('IHttpServer');
const IRequestHandler = DI.createInterface('IRequestHandler');
const IHttp2FileServer = DI.createInterface('IHttp2FileServer');

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
var ContentType;
(function (ContentType) {
    ContentType["unknown"] = "";
    ContentType["json"] = "application/json; charset=utf-8";
    ContentType["javascript"] = "application/javascript; charset=utf-8";
    ContentType["plain"] = "text/plain; charset=utf-8";
    ContentType["html"] = "text/html; charset=utf-8";
    ContentType["css"] = "text/css; charset=utf-8";
})(ContentType || (ContentType = {}));
var ContentEncoding;
(function (ContentEncoding) {
    ContentEncoding["identity"] = "identity";
    ContentEncoding["br"] = "br";
    ContentEncoding["gzip"] = "gzip";
    ContentEncoding["compress"] = "compress";
    // deflate = 'deflate', // Need to deal with this later. No known fixed file extension for deflate
})(ContentEncoding || (ContentEncoding = {}));
class HTTPError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
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
            case '.js': return "application/javascript; charset=utf-8" /* javascript */;
            case '.css': return "text/css; charset=utf-8" /* css */;
            case '.json': return "application/json; charset=utf-8" /* json */;
            case '.html': return "text/html; charset=utf-8" /* html */;
        }
    }
    return "text/plain; charset=utf-8" /* plain */;
}
function getContentEncoding(path) {
    const i = path.lastIndexOf('.');
    if (i >= 0) {
        switch (path.slice(i)) {
            case '.br': return "br" /* br */;
            case '.gz': return "gzip" /* gzip */;
            case '.lzw': return "compress" /* compress */;
        }
    }
    return "identity" /* identity */;
}
const wildcardHeaderValue = {
    [constants.HTTP2_HEADER_ACCEPT_ENCODING]: '*',
    [constants.HTTP2_HEADER_ACCEPT]: '*/*',
    [constants.HTTP2_HEADER_ACCEPT_CHARSET]: '*',
    [constants.HTTP2_HEADER_ACCEPT_LANGUAGE]: '*',
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

async function readFile(path, options) {
    return new Promise(function (resolve, reject) {
        readFile$1(path, options, function (err, data) {
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
        access(path, constants$1.F_OK, (err) => {
            resolve(err === null);
        });
    });
}
async function exists(path) {
    return new Promise(res => { exists$1(path, res); });
}

const { HTTP2_HEADER_PATH, HTTP2_HEADER_CONTENT_LENGTH, HTTP2_HEADER_LAST_MODIFIED, HTTP2_HEADER_CONTENT_TYPE, HTTP2_HEADER_ACCEPT_ENCODING, HTTP2_HEADER_CONTENT_ENCODING, HTTP2_HEADER_CACHE_CONTROL } = constants;
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
        this.root = resolve(opts.root);
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    async handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof IncomingMessage && response instanceof ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const path = join(this.root, parsedUrl.path);
        if (await isReadable(path)) {
            this.logger.debug(`Serving file "${path}"`);
            const contentType = getContentType(path);
            const clientEncoding = determineContentEncoding(context);
            let contentEncoding = (void 0);
            let content = (void 0);
            if (clientEncoding === 'br'
                || clientEncoding === 'gzip'
                || clientEncoding === 'compress') {
                const compressedFile = `${path}${contentEncodingExtensionMap[clientEncoding]}`;
                if (await exists(compressedFile)) {
                    content = await readFile(compressedFile);
                    contentEncoding = getContentEncoding(compressedFile);
                }
            }
            // handles 'identity' and 'deflate' (as no specific extension is known, and on-the-fly compression might be expensive)
            if (contentEncoding === void 0 || content === void 0) {
                content = await readFile(path);
                contentEncoding = getContentEncoding(path);
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
    __param(0, IHttpServerOptions),
    __param(1, ILogger)
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
        this.root = resolve(opts.root);
        this.prepare();
        this.logger.debug(`Now serving files from: "${this.root}"`);
    }
    handleRequest(context) {
        const request = context.request;
        const response = context.response;
        if (!(request instanceof Http2ServerRequest && response instanceof Http2ServerResponse)) {
            return;
        }
        const parsedUrl = context.requestUrl;
        const parsedPath = parsedUrl.path;
        const path = join(this.root, parsedPath);
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
            if (!path.endsWith('index.html') && !compressedFileExtensions.has(extname(path))) {
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
        for (const item of readdirSync(root)) {
            const path = join(root, item);
            const stats = statSync(path);
            if (stats.isFile()) {
                this.filePushMap.set(`/${relative(this.root, path)}`, PushInfo.create(path, cacheControlDirective));
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
    __param(0, IHttpServerOptions),
    __param(1, ILogger)
], Http2FileServer);
class PushInfo {
    constructor(fd, headers) {
        this.fd = fd;
        this.headers = headers;
    }
    static create(path, cacheControlDirective) {
        const stat = statSync(path);
        return new PushInfo(openSync(path, 'r'), {
            [HTTP2_HEADER_CONTENT_LENGTH]: stat.size,
            [HTTP2_HEADER_LAST_MODIFIED]: stat.mtime.toUTCString(),
            [HTTP2_HEADER_CONTENT_TYPE]: getContentType(path),
            [HTTP2_HEADER_CONTENT_ENCODING]: getContentEncoding(path),
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

// Copyright Joyent, Inc. and other Node contributors.

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

var HttpContextState;
(function (HttpContextState) {
    HttpContextState[HttpContextState["head"] = 1] = "head";
    HttpContextState[HttpContextState["body"] = 2] = "body";
    HttpContextState[HttpContextState["end"] = 3] = "end";
})(HttpContextState || (HttpContextState = {}));
class HttpContext {
    constructor(container, request, response, requestBuffer) {
        this.request = request;
        this.response = response;
        this.requestBuffer = requestBuffer;
        this.state = 1 /* head */;
        this.parsedHeaders = Object.create(null);
        this.rewrittenUrl = null;
        this.container = container.createChild();
        this._requestUrl = undefined(request.url);
    }
    getQualifiedRequestHeaderFor(headerName) {
        var _a;
        return (_a = this.parsedHeaders[headerName]) !== null && _a !== void 0 ? _a : (this.parsedHeaders[headerName] = new QualifiedHeaderValues(headerName, this.request.headers));
    }
    rewriteRequestUrl(url) {
        this.rewrittenUrl = undefined(url);
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
            ? https.createServer({ key: readFileSync(key), cert: readFileSync(cert) }, this.handleRequest)
            : createServer(this.handleRequest)).listen(port, hostName);
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
            res.statusCode = 500 /* InternalServerError */;
            res.end();
        }
    }
};
__decorate([
    bound
], HttpServer.prototype, "handleRequest", null);
HttpServer = __decorate([
    __param(0, ILogger),
    __param(1, IHttpServerOptions),
    __param(2, IContainer),
    __param(3, all(IRequestHandler))
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
        const server = this.server = createSecureServer({
            key: readFileSync(key),
            cert: readFileSync(cert)
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
            res.statusCode = 500 /* InternalServerError */;
            res.end();
        }
    }
};
__decorate([
    bound
], Http2Server.prototype, "handleRequest", null);
Http2Server = __decorate([
    __param(0, ILogger),
    __param(1, IHttpServerOptions),
    __param(2, IContainer),
    __param(3, IHttp2FileServer)
], Http2Server);

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
            || !context.getQualifiedRequestHeaderFor(constants.HTTP2_HEADER_ACCEPT).isAccepted('text/html')
            || url.lastIndexOf('.') > url.lastIndexOf('/')) {
            return;
        }
        context.rewriteRequestUrl('/index.html');
    }
}

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
        return `${indent}root${EOL}`
            + `${l2Indent}Description: The HTTP or HTTP/2 server serves the files from this directory${EOL}`
            + `${l2Indent}Value: ${this.root}${EOL}`
            + `${indent}hostName${EOL}`
            + `${l2Indent}Description: The host-name to be used${EOL}`
            + `${l2Indent}Value: ${this.hostName}${EOL}`
            + `${indent}port${EOL}`
            + `${l2Indent}Description: The port to be used${EOL}`
            + `${l2Indent}Value: ${this.port}${EOL}`
            + `${indent}useHttp2${EOL}`
            + `${l2Indent}Description: Whether to use HTTP/2 or not${EOL}`
            + `${l2Indent}Value: ${this.useHttp2}${EOL}`
            + `${indent}useHttps${EOL}`
            + `${l2Indent}Description: Whether to use SSL or not${EOL}`
            + `${l2Indent}Value: ${this.useHttps}${EOL}`
            + `${indent}key${EOL}`
            + `${l2Indent}Description: Optional path to the key file; required for https:// and HTTP/2${EOL}`
            + `${l2Indent}Value: ${this.key}${EOL}`
            + `${indent}cert${EOL}`
            + `${l2Indent}Description: Optional path to the certificate file; required for https:// and HTTP/2${EOL}`
            + `${l2Indent}Value: ${this.cert}${EOL}`
            + `${indent}logLevel${EOL}`
            + `${l2Indent}Description: Log level used by the HTTP server${EOL}`
            + `${l2Indent}Value: ${this.logLevel}${EOL}`;
    }
    get level() {
        const logLevel = this.logLevel;
        if (typeof logLevel === 'number') {
            return logLevel;
        }
        switch (logLevel) {
            case 'trace': return 0 /* trace */;
            case 'debug': return 1 /* debug */;
            case 'info': return 2 /* info */;
            case 'warn': return 3 /* warn */;
            case 'error': return 4 /* error */;
            case 'fatal': return 5 /* fatal */;
            case 'none': return 6 /* none */;
        }
    }
    applyOptionsFromCli(cwd, args, argPrefix = '') {
        const unconsumedArgs = [];
        while (args.length > 0) {
            const key = args[0].trim().replace(/-/g, '');
            const value = args[1];
            switch (key) {
                case `${argPrefix}root`:
                    this.root = resolve(cwd, value);
                    break;
                case `${argPrefix}hostName`:
                    this.hostName = value;
                    break;
                case `${argPrefix}port`:
                    this.port = Number(value);
                    break;
                case `${argPrefix}key`:
                    this.key = resolve(cwd, value);
                    break;
                case `${argPrefix}cert`:
                    this.cert = resolve(cwd, value);
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

const opts = new HttpServerOptions();
const HttpServerConfiguration = {
    create(customization) {
        opts.applyConfig(customization);
        opts.validate();
        return {
            register(container) {
                container.register(Registration.instance(IHttpServerOptions, opts), Registration.singleton(IRequestHandler, PushStateHandler), Registration.singleton(IRequestHandler, FileServer), Registration.singleton(IHttp2FileServer, Http2FileServer), LoggerConfiguration.create({ sinks: [ConsoleSink], level: opts.level, colorOptions: 1 /* colors */ }), Registration.instance(IPlatform, new Platform(globalThis)));
                if (opts.useHttp2) {
                    container.register(Registration.singleton(IHttpServer, Http2Server));
                }
                else {
                    container.register(Registration.singleton(IHttpServer, HttpServer));
                }
                return container;
            },
        };
    }
};

const normalizePath = (function () {
    const cache = Object.create(null);
    const regex = /\\/g;
    return function (path) {
        let normalized = cache[path];
        if (normalized === void 0) {
            normalized = cache[path] = path.replace(regex, '/');
        }
        return normalized;
    };
})();
function joinPath(...paths) {
    return normalizePath(join(...paths));
}
function resolvePath(...paths) {
    return normalizePath(resolve(...paths));
}

export { ContentType, Encoding, FileServer, HTTPError, HTTPStatusCode, HttpContext, HttpContextState, HttpServer, HttpServerOptions, IHttpServer, IHttpServerOptions, IRequestHandler, HttpServerConfiguration as RuntimeNodeConfiguration, getContentType, joinPath, normalizePath, readBuffer, resolvePath };
//# sourceMappingURL=index.js.map
