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
        this.container = container.createChild();
    }
}
//# sourceMappingURL=http-context.js.map