import { Registration, Metadata, Protocol, mergeArrays, firstDefined, } from '@aurelia/kernel';
import { registerAliases } from '../definitions';
export function valueConverter(nameOrDef) {
    return function (target) {
        return ValueConverter.define(nameOrDef, target);
    };
}
export class ValueConverterDefinition {
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
        return new ValueConverterDefinition(Type, firstDefined(ValueConverter.getAnnotation(Type, 'name'), name), mergeArrays(ValueConverter.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), ValueConverter.keyFrom(name));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.alias(key, Type).register(container);
        registerAliases(aliases, ValueConverter, key, container);
    }
}
export const ValueConverter = {
    name: Protocol.resource.keyFor('value-converter'),
    keyFrom(name) {
        return `${ValueConverter.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(ValueConverter.name, value);
    },
    define(nameOrDef, Type) {
        const definition = ValueConverterDefinition.create(nameOrDef, Type);
        Metadata.define(ValueConverter.name, definition, definition.Type);
        Metadata.define(ValueConverter.name, definition, definition);
        Protocol.resource.appendTo(Type, ValueConverter.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(ValueConverter.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};
//# sourceMappingURL=value-converter.js.map