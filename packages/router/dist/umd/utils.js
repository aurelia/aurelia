(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    function closestCustomElement(element) {
        let el = element;
        while (el !== null) {
            if (runtime_1.CustomElement.for(el) !== void 0) {
                break;
            }
            el = el.parentElement;
        }
        return el;
    }
    exports.closestCustomElement = closestCustomElement;
    function arrayRemove(arr, func) {
        const removed = [];
        let arrIndex = arr.findIndex(func);
        while (arrIndex >= 0) {
            removed.push(arr.splice(arrIndex, 1)[0]);
            arrIndex = arr.findIndex(func);
        }
        return removed;
    }
    exports.arrayRemove = arrayRemove;
});
//# sourceMappingURL=utils.js.map