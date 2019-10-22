import { camelCase, Registration, mergeArrays, Protocol, firstDefined, Metadata } from '@aurelia/kernel';
import { registerAliases } from '@aurelia/runtime';
export function bindingCommand(nameOrDefinition) {
    return function (target) {
        return BindingCommand.define(nameOrDefinition, target);
    };
}
export class BindingCommandDefinition {
    constructor(Type, name, aliases, key, type) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.type = type;
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
        return new BindingCommandDefinition(Type, firstDefined(BindingCommand.getAnnotation(Type, 'name'), name), mergeArrays(BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingCommand.keyFrom(name), firstDefined(BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.alias(key, Type).register(container);
        registerAliases(aliases, BindingCommand, key, container);
    }
}
export const BindingCommand = {
    name: Protocol.resource.keyFor('binding-command'),
    keyFrom(name) {
        return `${BindingCommand.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingCommand.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        Metadata.define(BindingCommand.name, definition, definition.Type);
        Metadata.define(BindingCommand.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingCommand.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingCommand.name, Type);
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
export function getTarget(binding, makeCamelCase) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.propName;
    }
    else if (makeCamelCase) {
        return camelCase(binding.syntax.target);
    }
    else {
        return binding.syntax.target;
    }
}
//# sourceMappingURL=binding-command.js.map