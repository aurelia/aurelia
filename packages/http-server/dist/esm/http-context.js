import * as $url from 'url';
import { QualifiedHeaderValues } from './http-utils.js';
export var HttpContextState;
(function (HttpContextState) {
    HttpContextState[HttpContextState["head"] = 1] = "head";
    HttpContextState[HttpContextState["body"] = 2] = "body";
    HttpContextState[HttpContextState["end"] = 3] = "end";
})(HttpContextState || (HttpContextState = {}));
export class HttpContext {
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
            ?? (this.parsedHeaders[headerName] = new QualifiedHeaderValues(headerName, this.request.headers));
    }
    rewriteRequestUrl(url) {
        this.rewrittenUrl = $url.parse(url);
    }
    get requestUrl() {
        return this.rewrittenUrl ?? this._requestUrl;
    }
}
//# sourceMappingURL=http-context.js.map