import { PLATFORM, Registration } from '@aurelia/kernel';
import { customAttributeKey, customAttributeName, HooksDefinition } from '../definitions';
import { BindingMode, ensureValidStrategy, } from '../flags';
import { Bindable } from '../templating/bindable';
/** @internal */
export function registerAttribute(container) {
    const description = this.description;
    const resourceKey = this.kind.keyFrom(description.name);
    const aliases = description.aliases;
    container.register(Registration.transient(resourceKey, this));
    container.register(Registration.transient(this, this));
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        const aliasKey = this.kind.keyFrom(aliases[i]);
        container.register(Registration.alias(resourceKey, aliasKey));
    }
}
export function customAttribute(nameOrDefinition) {
    return target => CustomAttributeResource.define(nameOrDefinition, target); // TODO: fix this at some point
}
export function templateController(nameOrDefinition) {
    return target => CustomAttributeResource.define(typeof nameOrDefinition === 'string'
        ? { isTemplateController: true, name: nameOrDefinition }
        : { isTemplateController: true, ...nameOrDefinition }, target); // TODO: fix this at some point
}
function dynamicOptionsDecorator(target) {
    target.hasDynamicOptions = true;
    return target;
}
export function dynamicOptions(target) {
    return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator(target);
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor) {
    const Type = ctor;
    const WritableType = Type;
    const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);
    WritableType.kind = CustomAttributeResource;
    WritableType.description = description;
    Type.register = registerAttribute;
    return Type;
}
export const CustomAttributeResource = {
    name: customAttributeName,
    keyFrom: customAttributeKey,
    isType,
    define
};
/** @internal */
export function createCustomAttributeDescription(def, Type) {
    const aliases = def.aliases;
    const defaultBindingMode = def.defaultBindingMode;
    return {
        name: def.name,
        aliases: aliases == null ? PLATFORM.emptyArray : aliases,
        defaultBindingMode: defaultBindingMode == null ? BindingMode.toView : defaultBindingMode,
        hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
        isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
        bindables: { ...Bindable.for(Type).get(), ...Bindable.for(def).get() },
        strategy: ensureValidStrategy(def.strategy),
        hooks: new HooksDefinition(Type.prototype)
    };
}
//# sourceMappingURL=custom-attribute.js.map