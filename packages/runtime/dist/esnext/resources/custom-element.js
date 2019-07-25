import { DI, Registration, Reporter } from '@aurelia/kernel';
import { buildTemplateDefinition } from '../definitions';
export const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
export function customElement(nameOrDefinition) {
    return (target => CustomElement.define(nameOrDefinition, target));
}
export const CustomElement = Object.freeze({
    name: 'custom-element',
    keyFrom(name) {
        return `${CustomElement.name}:${name}`;
    },
    isType(Type) {
        return Type.kind === CustomElement;
    },
    behaviorFor(node) {
        return node.$controller;
    },
    define(nameOrDefinition, ctor = null) {
        if (!nameOrDefinition) {
            throw Reporter.error(70);
        }
        const Type = (ctor == null ? class HTMLOnlyElement {
        } : ctor);
        const WritableType = Type;
        const description = buildTemplateDefinition(Type, nameOrDefinition);
        WritableType.kind = CustomElement;
        Type.description = description;
        Type.register = function register(container) {
            const key = CustomElement.keyFrom(description.name);
            Registration.transient(key, Type).register(container);
            Registration.alias(key, Type).register(container);
        };
        return Type;
    },
});
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