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
    exports.ReentryBehavior = void 0;
    var ReentryBehavior;
    (function (ReentryBehavior) {
        ReentryBehavior["default"] = "default";
        ReentryBehavior["disallow"] = "disallow";
        ReentryBehavior["load"] = "load";
        ReentryBehavior["refresh"] = "refresh";
    })(ReentryBehavior = exports.ReentryBehavior || (exports.ReentryBehavior = {}));
});
//# sourceMappingURL=interfaces.js.map