export const def = Reflect.defineProperty;
export function defineHiddenProp(obj, key, value) {
    def(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
}
export function ensureProto(proto, key, defaultValue, force = false) {
    if (force || !Object.prototype.hasOwnProperty.call(proto, key)) {
        defineHiddenProp(proto, key, defaultValue);
    }
}
//# sourceMappingURL=utilities-objects.js.map