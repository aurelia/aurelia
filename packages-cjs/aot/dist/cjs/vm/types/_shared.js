"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareIndices = exports.Uint8Clamp = exports.Uint8 = exports.Int8 = exports.Uint16 = exports.Int16 = exports.Uint32 = exports.Int32 = exports.getPath = exports.nextValueId = exports.CompletionType = void 0;
var CompletionType;
(function (CompletionType) {
    CompletionType[CompletionType["normal"] = 1] = "normal";
    CompletionType[CompletionType["break"] = 2] = "break";
    CompletionType[CompletionType["continue"] = 3] = "continue";
    CompletionType[CompletionType["return"] = 4] = "return";
    CompletionType[CompletionType["throw"] = 5] = "throw";
})(CompletionType = exports.CompletionType || (exports.CompletionType = {}));
exports.nextValueId = (function () {
    let id = 0;
    return function () {
        return ++id;
    };
})();
function getPath(obj) {
    return obj.path;
}
exports.getPath = getPath;
exports.Int32 = (function () {
    const $ = new Int32Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Uint32 = (function () {
    const $ = new Uint32Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Int16 = (function () {
    const $ = new Int16Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Uint16 = (function () {
    const $ = new Uint16Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Int8 = (function () {
    const $ = new Int8Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Uint8 = (function () {
    const $ = new Uint8Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
exports.Uint8Clamp = (function () {
    const $ = new Uint8ClampedArray(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
// Sort two strings numerically instead of alphabetically
function compareIndices(a, b) {
    // Rely on coercion as natively subtracting strings has some shortcuts (for better perf) compared to explicitly converting to number first
    return a['[[Value]]'] - b['[[Value]]'];
}
exports.compareIndices = compareIndices;
//# sourceMappingURL=_shared.js.map