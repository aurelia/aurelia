"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpContext = exports.HttpContextState = void 0;
const $url = require("url");
const http_utils_js_1 = require("./http-utils.js");
var HttpContextState;
(function (HttpContextState) {
    HttpContextState[HttpContextState["head"] = 1] = "head";
    HttpContextState[HttpContextState["body"] = 2] = "body";
    HttpContextState[HttpContextState["end"] = 3] = "end";
})(HttpContextState = exports.HttpContextState || (exports.HttpContextState = {}));
class HttpContext {
    constructor(container, request, response, requestBuffer) {
        this.request = request;
        this.response = response;
        this.requestBuffer = requestBuffer;
        this.state = 1 /* head */;
        this.parsedHeaders = Object.create(null);
        this.rewrittenUrl = null;
        this.container = container.createChild();
        this._requestUrl = $url.parse(request.url);
    }
    getQualifiedRequestHeaderFor(headerName) {
        return this.parsedHeaders[headerName]
            ?? (this.parsedHeaders[headerName] = new http_utils_js_1.QualifiedHeaderValues(headerName, this.request.headers));
    }
    rewriteRequestUrl(url) {
        this.rewrittenUrl = $url.parse(url);
    }
    get requestUrl() {
        return this.rewrittenUrl ?? this._requestUrl;
    }
}
exports.HttpContext = HttpContext;
//# sourceMappingURL=http-context.js.map