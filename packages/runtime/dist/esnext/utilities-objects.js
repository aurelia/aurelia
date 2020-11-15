export function defineHiddenProp(obj, key, value) {
    Reflect.defineProperty(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
}
export function ensureProto(proto, key, defaultValue) {
    if (!Object.prototype.hasOwnProperty.call(proto, key)) {
        defineHiddenProp(proto, key, defaultValue);
    }
}
//# sourceMappingURL=utilities-objects.js.map