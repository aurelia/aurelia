"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueConverter = exports.ValueConverterDefinition = exports.valueConverter = void 0;
const kernel_1 = require("@aurelia/kernel");
const alias_js_1 = require("./alias.js");
function valueConverter(nameOrDef) {
    return function (target) {
        return exports.ValueConverter.define(nameOrDef, target);
    };
}
exports.valueConverter = valueConverter;
class ValueConverterDefinition {
    constructor(Type, name, aliases, key) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new ValueConverterDefinition(Type, kernel_1.firstDefined(exports.ValueConverter.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.ValueConverter.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.ValueConverter.keyFrom(name));
    }
    register(container) {
        const { Type, key, aliases } = this;
        kernel_1.Registration.singleton(key, Type).register(container);
        kernel_1.Registration.aliasTo(key, Type).register(container);
        alias_js_1.registerAliases(aliases, exports.ValueConverter, key, container);
    }
}
exports.ValueConverterDefinition = ValueConverterDefinition;
exports.ValueConverter = {
    name: kernel_1.Protocol.resource.keyFor('value-converter'),
    keyFrom(name) {
        return `${exports.ValueConverter.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.ValueConverter.name, value);
    },
    define(nameOrDef, Type) {
        const definition = ValueConverterDefinition.create(nameOrDef, Type);
        kernel_1.Metadata.define(exports.ValueConverter.name, definition, definition.Type);
        kernel_1.Metadata.define(exports.ValueConverter.name, definition, definition);
        kernel_1.Protocol.resource.appendTo(Type, exports.ValueConverter.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = kernel_1.Metadata.getOwn(exports.ValueConverter.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        kernel_1.Metadata.define(kernel_1.Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return kernel_1.Metadata.getOwn(kernel_1.Protocol.annotation.keyFor(prop), Type);
    },
};
//# sourceMappingURL=value-converter.js.map