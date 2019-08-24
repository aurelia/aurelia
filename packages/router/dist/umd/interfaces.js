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
    var ReentryBehavior;
    (function (ReentryBehavior) {
        ReentryBehavior["default"] = "default";
        ReentryBehavior["disallow"] = "disallow";
        ReentryBehavior["enter"] = "enter";
        ReentryBehavior["refresh"] = "refresh";
    })(ReentryBehavior = exports.ReentryBehavior || (exports.ReentryBehavior = {}));
});
//# sourceMappingURL=interfaces.js.map