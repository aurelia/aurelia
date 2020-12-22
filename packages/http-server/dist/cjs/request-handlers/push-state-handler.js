"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushStateHandler = void 0;
const http2_1 = require("http2");
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
            || !context.getQualifiedRequestHeaderFor(http2_1.constants.HTTP2_HEADER_ACCEPT).isAccepted('text/html')
            || url.lastIndexOf('.') > url.lastIndexOf('/')) {
            return;
        }
        context.rewriteRequestUrl('/index.html');
    }
}
exports.PushStateHandler = PushStateHandler;
//# sourceMappingURL=push-state-handler.js.map