// These types are duck-typed representations of parts of the RequireJs Load API [1] used by this plugin.
// They are handcrafted as '@types/requirejs' is incomplete and it conflicts with '@types/node'. See [2] for details.
// [1] https://requirejs.org/docs/plugins.html#apiload
// [2] https://github.com/aurelia/aurelia/pull/256
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
});
//# sourceMappingURL=types.js.map