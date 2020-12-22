export var CompletionType;
(function (CompletionType) {
    CompletionType[CompletionType["normal"] = 1] = "normal";
    CompletionType[CompletionType["break"] = 2] = "break";
    CompletionType[CompletionType["continue"] = 3] = "continue";
    CompletionType[CompletionType["return"] = 4] = "return";
    CompletionType[CompletionType["throw"] = 5] = "throw";
})(CompletionType || (CompletionType = {}));
export const nextValueId = (function () {
    let id = 0;
    return function () {
        return ++id;
    };
})();
export function getPath(obj) {
    return obj.path;
}
export const Int32 = (function () {
    const $ = new Int32Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Uint32 = (function () {
    const $ = new Uint32Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Int16 = (function () {
    const $ = new Int16Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Uint16 = (function () {
    const $ = new Uint16Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Int8 = (function () {
    const $ = new Int8Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Uint8 = (function () {
    const $ = new Uint8Array(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
export const Uint8Clamp = (function () {
    const $ = new Uint8ClampedArray(1);
    return function (value) {
        $[0] = Number(value);
        return $[0];
    };
})();
// Sort two strings numerically instead of alphabetically
export function compareIndices(a, b) {
    // Rely on coercion as natively subtracting strings has some shortcuts (for better perf) compared to explicitly converting to number first
    return a['[[Value]]'] - b['[[Value]]'];
}
//# sourceMappingURL=_shared.js.map