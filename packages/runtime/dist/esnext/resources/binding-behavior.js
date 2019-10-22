import { Registration, Metadata, Protocol, mergeArrays, firstDefined, } from '@aurelia/kernel';
import { registerAliases } from '../definitions';
export function bindingBehavior(nameOrDef) {
    return function (target) {
        return BindingBehavior.define(nameOrDef, target);
    };
}
export class BindingBehaviorDefinition {
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
        return new BindingBehaviorDefinition(Type, firstDefined(BindingBehavior.getAnnotation(Type, 'name'), name), mergeArrays(BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingBehavior.keyFrom(name));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.alias(key, Type).register(container);
        registerAliases(aliases, BindingBehavior, key, container);
    }
}
export const BindingBehavior = {
    name: Protocol.resource.keyFor('binding-behavior'),
    keyFrom(name) {
        return `${BindingBehavior.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingBehavior.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
        Metadata.define(BindingBehavior.name, definition, definition.Type);
        Metadata.define(BindingBehavior.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingBehavior.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingBehavior.name, Type);
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
//# sourceMappingURL=binding-behavior.js.map