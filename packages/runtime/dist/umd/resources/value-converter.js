(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../definitions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../definitions");
    function valueConverter(nameOrDefinition) {
        return target => exports.ValueConverter.define(nameOrDefinition, target); // TODO: fix this at some point
    }
    exports.valueConverter = valueConverter;
    exports.ValueConverter = Object.freeze({
        name: 'value-converter',
        keyFrom(name) {
            return `${exports.ValueConverter.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === exports.ValueConverter;
        },
        define(nameOrDefinition, ctor) {
            const Type = ctor;
            const WritableType = Type;
            const description = createCustomValueDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
            WritableType.kind = exports.ValueConverter;
            WritableType.description = description;
            WritableType.aliases = Type.aliases == null ? kernel_1.PLATFORM.emptyArray : Type.aliases;
            Type.register = function register(container) {
                const aliases = description.aliases;
                const key = exports.ValueConverter.keyFrom(description.name);
                kernel_1.Registration.singleton(key, this).register(container);
                kernel_1.Registration.alias(key, this).register(container);
                definitions_1.registerAliases([...aliases, ...this.aliases], exports.ValueConverter, key, container);
            };
            return Type;
        },
    });
    /** @internal */
    function createCustomValueDescription(def, Type) {
        const aliases = def.aliases;
        return {
            name: def.name,
            aliases: aliases == null ? kernel_1.PLATFORM.emptyArray : aliases,
        };
    }
    exports.createCustomValueDescription = createCustomValueDescription;
});
//# sourceMappingURL=value-converter.js.map