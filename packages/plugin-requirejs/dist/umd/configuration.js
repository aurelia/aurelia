(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./component", "./view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const componentPlugin = require("./component");
    const viewPlugin = require("./view");
    const nonAnonDefine = define;
    function installRequireJSPlugins() {
        nonAnonDefine('view', [], viewPlugin);
        nonAnonDefine('component', [], componentPlugin);
    }
    exports.installRequireJSPlugins = installRequireJSPlugins;
});
//# sourceMappingURL=configuration.js.map