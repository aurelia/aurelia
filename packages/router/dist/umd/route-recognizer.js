(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/route-recognizer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const route_recognizer_1 = require("@aurelia/route-recognizer");
    exports.RouteRecognizer = route_recognizer_1.RouteRecognizer;
    exports.ConfigurableRoute = route_recognizer_1.ConfigurableRoute;
    exports.RecognizedRoute = route_recognizer_1.RecognizedRoute;
    exports.Endpoint = route_recognizer_1.Endpoint;
});
//# sourceMappingURL=route-recognizer.js.map