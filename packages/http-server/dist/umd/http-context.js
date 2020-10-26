(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpContext = exports.HttpContextState = void 0;
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
            this.container = container.createChild();
        }
    }
    exports.HttpContext = HttpContext;
});
//# sourceMappingURL=http-context.js.map