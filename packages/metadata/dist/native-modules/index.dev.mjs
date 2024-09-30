/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TODO: add description.
 * References:
 * - https://github.com/tc39/proposal-decorator-metadata
 * - https://github.com/microsoft/TypeScript/issues/55788
 */
function initializeTC39Metadata() {
    // We need the any-coercion here because the metadata in Symbol is marked as unique symbol.
    // And the symbol we are creating here is not assignable to the unique symbol.
    // More info: https://github.com/Microsoft/TypeScript/issues/23388
    Symbol.metadata ??= Symbol.for("Symbol.metadata");
}
const Metadata = {
    get(key, type) {
        return type[Symbol.metadata]?.[key];
    },
    define(value, type, ...keys) {
        // Define metadata on the type, when absent.
        // Note that TS also does exactly that when decorators are used.
        // This avoids the problem of children inheriting and overwriting metadata from their parents.
        let metadata = Object.getOwnPropertyDescriptor(type, Symbol.metadata)?.value;
        if (metadata == null) {
            Object.defineProperty(type, Symbol.metadata, { value: metadata = Object.create(null), enumerable: true, configurable: true, writable: true });
        }
        const length = keys.length;
        switch (length) {
            case 0: throw new Error('At least one key must be provided');
            case 1:
                metadata[keys[0]] = value;
                return;
            case 2:
                metadata[keys[0]] = metadata[keys[1]] = value;
                return;
            default: {
                for (let i = 0; i < length; ++i) {
                    metadata[keys[i]] = value;
                }
                return;
            }
        }
    },
    has(key, type) {
        const metadata = type[Symbol.metadata];
        return metadata == null
            ? false
            : key in metadata;
    },
    delete(key, type) {
        const metadata = type[Symbol.metadata];
        if (metadata == null)
            return;
        Reflect.deleteProperty(metadata, key);
        return;
    },
};

export { Metadata, initializeTC39Metadata };
//# sourceMappingURL=index.dev.mjs.map
