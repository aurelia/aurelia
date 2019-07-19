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
    function fileBase(filePath) {
        const fileName = filePath.split(/\\|\//).pop();
        const dotIdx = fileName.lastIndexOf('.');
        return dotIdx >= 0 ? fileName.slice(0, dotIdx) : fileName;
    }
    exports.fileBase = fileBase;
});
//# sourceMappingURL=file-base.js.map