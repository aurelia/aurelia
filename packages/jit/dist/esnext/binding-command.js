import { camelCase, Registration, PLATFORM } from '@aurelia/kernel';
import { registerAliases } from '@aurelia/runtime';
export function bindingCommand(nameOrDefinition) {
    return target => BindingCommandResource.define(nameOrDefinition, target); // TODO: fix this at some point
}
export const BindingCommandResource = Object.freeze({
    name: 'binding-command',
    keyFrom(name) {
        return `${BindingCommandResource.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === BindingCommandResource;
    },
    define(nameOrDefinition, ctor) {
        const Type = ctor;
        const WritableType = Type;
        const description = createBindingCommandDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, type: null } : nameOrDefinition, Type);
        WritableType.kind = BindingCommandResource;
        WritableType.description = description;
        Type.register = function register(container) {
            const aliases = description.aliases;
            const key = BindingCommandResource.keyFrom(description.name);
            Registration.singleton(key, Type).register(container);
            Registration.alias(key, Type).register(container);
            registerAliases([...aliases, ...this.aliases], BindingCommandResource, key, container);
        };
        return Type;
    },
});
/** @internal */
export function createBindingCommandDescription(def, Type) {
    const aliases = def.aliases;
    Type.aliases = Type.aliases == null ? PLATFORM.emptyArray : Type.aliases;
    return {
        name: def.name,
        type: def.type == null ? null : def.type,
        aliases: aliases == null ? PLATFORM.emptyArray : aliases,
    };
}
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