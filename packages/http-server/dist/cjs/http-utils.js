"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualifiedHeaderValues = exports.getContentEncoding = exports.getContentType = exports.readBuffer = exports.HTTPError = exports.ContentEncoding = exports.ContentType = exports.HTTPStatusCode = void 0;
const http2_1 = require("http2");
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
})(HTTPStatusCode = exports.HTTPStatusCode || (exports.HTTPStatusCode = {}));
var ContentType;
(function (ContentType) {
    ContentType["unknown"] = "";
    ContentType["json"] = "application/json; charset=utf-8";
    ContentType["javascript"] = "application/javascript; charset=utf-8";
    ContentType["plain"] = "text/plain; charset=utf-8";
    ContentType["html"] = "text/html; charset=utf-8";
    ContentType["css"] = "text/css; charset=utf-8";
})(ContentType = exports.ContentType || (exports.ContentType = {}));
var ContentEncoding;
(function (ContentEncoding) {
    ContentEncoding["identity"] = "identity";
    ContentEncoding["br"] = "br";
    ContentEncoding["gzip"] = "gzip";
    ContentEncoding["compress"] = "compress";
    // deflate = 'deflate', // Need to deal with this later. No known fixed file extension for deflate
})(ContentEncoding = exports.ContentEncoding || (exports.ContentEncoding = {}));
class HTTPError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.HTTPError = HTTPError;
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
exports.readBuffer = readBuffer;
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
exports.getContentType = getContentType;
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
exports.getContentEncoding = getContentEncoding;
const wildcardHeaderValue = {
    [http2_1.constants.HTTP2_HEADER_ACCEPT_ENCODING]: '*',
    [http2_1.constants.HTTP2_HEADER_ACCEPT]: '*/*',
    [http2_1.constants.HTTP2_HEADER_ACCEPT_CHARSET]: '*',
    [http2_1.constants.HTTP2_HEADER_ACCEPT_LANGUAGE]: '*',
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
exports.QualifiedHeaderValues = QualifiedHeaderValues;
//# sourceMappingURL=http-utils.js.map