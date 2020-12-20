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
    exports.ensureProto = exports.defineHiddenProp = exports.def = void 0;
    exports.def = Reflect.defineProperty;
    function defineHiddenProp(obj, key, value) {
        exports.def(obj, key, {
            enumerable: false,
            configurable: true,
            writable: true,
            value
        });
    }
    exports.defineHiddenProp = defineHiddenProp;
    function ensureProto(proto, key, defaultValue, force = false) {
        if (force || !Object.prototype.hasOwnProperty.call(proto, key)) {
            defineHiddenProp(proto, key, defaultValue);
        }
    }
    exports.ensureProto = ensureProto;
});
//# sourceMappingURL=utilities-objects.js.map