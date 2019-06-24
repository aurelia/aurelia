import { DI, Registration, Reporter } from '@aurelia/kernel';
import { buildTemplateDefinition, customElementBehavior, customElementKey, customElementName } from '../definitions';
export const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
/** @internal */
export function registerElement(container) {
    const resourceKey = this.kind.keyFrom(this.description.name);
    container.register(Registration.transient(resourceKey, this));
    container.register(Registration.transient(this, this));
}
export function customElement(nameOrDefinition) {
    return (target => CustomElementResource.define(nameOrDefinition, target));
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor = null) {
    if (!nameOrDefinition) {
        throw Reporter.error(70);
    }
    const Type = (ctor == null ? class HTMLOnlyElement {
    } : ctor);
    const WritableType = Type;
    const description = buildTemplateDefinition(Type, nameOrDefinition);
    WritableType.kind = CustomElementResource;
    Type.description = description;
    Type.register = registerElement;
    return Type;
}
export const CustomElementResource = {
    name: customElementName,
    keyFrom: customElementKey,
    isType,
    behaviorFor: customElementBehavior,
    define
};
const defaultShadowOptions = {
    mode: 'open'
};
export function useShadowDOM(targetOrOptions) {
    const options = typeof targetOrOptions === 'function' || !targetOrOptions
        ? defaultShadowOptions
        : targetOrOptions;
    function useShadowDOMDecorator(target) {
        target.shadowOptions = options;
        return target;
    }
    return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
}
function containerlessDecorator(target) {
    target.containerless = true;
    return target;
}
export function containerless(target) {
    return target === undefined ? containerlessDecorator : containerlessDecorator(target);
}
//# sourceMappingURL=custom-element.js.map