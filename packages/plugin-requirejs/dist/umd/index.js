(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./component", "./configuration", "./processing", "./view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    var component_1 = require("./component");
    exports.loadComponent = component_1.load;
    exports.writeComponent = component_1.write;
    tslib_1.__exportStar(require("./configuration"), exports);
    tslib_1.__exportStar(require("./processing"), exports);
    var view_1 = require("./view");
    exports.loadView = view_1.load;
    exports.writeView = view_1.write;
});
//# sourceMappingURL=index.js.map