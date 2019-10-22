import { Registration, Protocol, Metadata, mergeArrays, firstDefined, } from '@aurelia/kernel';
import { HooksDefinition, registerAliases, } from '../definitions';
import { BindingMode, } from '../flags';
import { Bindable } from '../templating/bindable';
export function customAttribute(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(nameOrDef, target);
    };
}
export function templateController(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(typeof nameOrDef === 'string'
            ? { isTemplateController: true, name: nameOrDef }
            : { isTemplateController: true, ...nameOrDef }, target);
    };
}
export class CustomAttributeDefinition {
    constructor(Type, name, aliases, key, defaultBindingMode, isTemplateController, bindables, strategy, hooks) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.defaultBindingMode = defaultBindingMode;
        this.isTemplateController = isTemplateController;
        this.bindables = bindables;
        this.strategy = strategy;
        this.hooks = hooks;
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
        return new CustomAttributeDefinition(Type, firstDefined(CustomAttribute.getAnnotation(Type, 'name'), name), mergeArrays(CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), CustomAttribute.keyFrom(name), firstDefined(CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView), firstDefined(CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), Bindable.from(...Bindable.getAll(Type), CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), firstDefined(CustomAttribute.getAnnotation(Type, 'strategy'), def.strategy, Type.strategy, 1 /* getterSetter */), firstDefined(CustomAttribute.getAnnotation(Type, 'hooks'), def.hooks, Type.hooks, new HooksDefinition(Type.prototype)));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.alias(key, Type).register(container);
        registerAliases(aliases, CustomAttribute, key, container);
    }
}
export const CustomAttribute = {
    name: Protocol.resource.keyFor('custom-attribute'),
    keyFrom(name) {
        return `${CustomAttribute.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomAttribute.name, value);
    },
    define(nameOrDef, Type) {
        const definition = CustomAttributeDefinition.create(nameOrDef, Type);
        Metadata.define(CustomAttribute.name, definition, definition.Type);
        Metadata.define(CustomAttribute.name, definition, definition);
        Protocol.resource.appendTo(Type, CustomAttribute.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomAttribute.name, Type);
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
//# sourceMappingURL=custom-attribute.js.map