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
    class AttrSyntax {
        constructor(rawName, rawValue, target, command) {
            this.rawName = rawName;
            this.rawValue = rawValue;
            this.target = target;
            this.command = command;
        }
    }
    exports.AttrSyntax = AttrSyntax;
});
//# sourceMappingURL=ast.js.map