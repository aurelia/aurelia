import { DI, Registration, Protocol, Metadata, mergeArrays, fromDefinitionOrDefault, pascalCase, fromAnnotationOrTypeOrDefault, fromAnnotationOrDefinitionOrTypeOrDefault, } from '@aurelia/kernel';
import { registerAliases, HooksDefinition, } from '../definitions';
import { DOM } from '../dom';
import { Bindable } from '../templating/bindable';
import { Children } from '../templating/children';
export function customElement(nameOrDef) {
    return function (target) {
        return CustomElement.define(nameOrDef, target);
    };
}
export function useShadowDOM(targetOrOptions) {
    if (targetOrOptions === void 0) {
        return function ($target) {
            CustomElement.annotate($target, 'shadowOptions', { mode: 'open' });
        };
    }
    if (typeof targetOrOptions !== 'function') {
        return function ($target) {
            CustomElement.annotate($target, 'shadowOptions', targetOrOptions);
        };
    }
    CustomElement.annotate(targetOrOptions, 'shadowOptions', { mode: 'open' });
}
export function containerless(target) {
    if (target === void 0) {
        return function ($target) {
            CustomElement.annotate($target, 'containerless', true);
        };
    }
    CustomElement.annotate(target, 'containerless', true);
}
export function strict(target) {
    if (target === void 0) {
        return function ($target) {
            CustomElement.annotate($target, 'isStrictBinding', true);
        };
    }
    CustomElement.annotate(target, 'isStrictBinding', true);
}
const definitionLookup = new WeakMap();
export class CustomElementDefinition {
    constructor(Type, name, aliases, key, cache, template, instructions, dependencies, injectable, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, strategy, hooks, scopeParts) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.cache = cache;
        this.template = template;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.injectable = injectable;
        this.needsCompile = needsCompile;
        this.surrogates = surrogates;
        this.bindables = bindables;
        this.childrenObservers = childrenObservers;
        this.containerless = containerless;
        this.isStrictBinding = isStrictBinding;
        this.shadowOptions = shadowOptions;
        this.hasSlots = hasSlots;
        this.strategy = strategy;
        this.hooks = hooks;
        this.scopeParts = scopeParts;
    }
    static create(nameOrDef, Type = null) {
        if (Type === null) {
            const def = nameOrDef;
            if (typeof def === 'string') {
                throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
            }
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const name = fromDefinitionOrDefault('name', def, CustomElement.generateName);
            if (typeof def.Type === 'function') {
                // This needs to be a clone (it will usually be the compiler calling this signature)
                // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
                // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
                Type = def.Type;
            }
            else {
                Type = CustomElement.generateType(pascalCase(name));
            }
            return new CustomElementDefinition(Type, name, mergeArrays(def.aliases), fromDefinitionOrDefault('key', def, () => CustomElement.keyFrom(name)), fromDefinitionOrDefault('cache', def, () => 0), fromDefinitionOrDefault('template', def, () => null), mergeArrays(def.instructions), mergeArrays(def.dependencies), fromDefinitionOrDefault('injectable', def, () => null), fromDefinitionOrDefault('needsCompile', def, () => true), mergeArrays(def.surrogates), Bindable.from(def.bindables), Children.from(def.childrenObservers), fromDefinitionOrDefault('containerless', def, () => false), fromDefinitionOrDefault('isStrictBinding', def, () => false), fromDefinitionOrDefault('shadowOptions', def, () => null), fromDefinitionOrDefault('hasSlots', def, () => false), fromDefinitionOrDefault('strategy', def, () => 1 /* getterSetter */), fromDefinitionOrDefault('hooks', def, () => HooksDefinition.none), mergeArrays(def.scopeParts));
        }
        // If a type is passed in, we ignore the Type property on the definition if it exists.
        // TODO: document this behavior
        if (typeof nameOrDef === 'string') {
            return new CustomElementDefinition(Type, nameOrDef, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), Type.aliases), CustomElement.keyFrom(nameOrDef), fromAnnotationOrTypeOrDefault('cache', Type, () => 0), fromAnnotationOrTypeOrDefault('template', Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies), fromAnnotationOrTypeOrDefault('injectable', Type, () => null), fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), fromAnnotationOrTypeOrDefault('containerless', Type, () => false), fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), fromAnnotationOrTypeOrDefault('strategy', Type, () => 1 /* getterSetter */), 
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            fromAnnotationOrTypeOrDefault('hooks', Type, () => new HooksDefinition(Type.prototype)), mergeArrays(CustomElement.getAnnotation(Type, 'scopeParts'), Type.scopeParts));
        }
        // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
        // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
        // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
        // if this turns out to be too opinionated.
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
        return new CustomElementDefinition(Type, name, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), CustomElement.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('strategy', nameOrDef, Type, () => 1 /* getterSetter */), 
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        fromAnnotationOrTypeOrDefault('hooks', Type, () => new HooksDefinition(Type.prototype)), mergeArrays(CustomElement.getAnnotation(Type, 'scopeParts'), nameOrDef.scopeParts, Type.scopeParts));
    }
    static getOrCreate(partialDefinition) {
        if (partialDefinition instanceof CustomElementDefinition) {
            return partialDefinition;
        }
        if (definitionLookup.has(partialDefinition)) {
            return definitionLookup.get(partialDefinition);
        }
        const definition = CustomElementDefinition.create(partialDefinition);
        definitionLookup.set(partialDefinition, definition);
        // Make sure the full definition can be retrieved from dynamically created classes as well
        Metadata.define(CustomElement.name, definition, definition.Type);
        return definition;
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomElement, key, container);
    }
}
export const CustomElement = {
    name: Protocol.resource.keyFor('custom-element'),
    keyFrom(name) {
        return `${CustomElement.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
    },
    for(node, nameOrSearchParents, searchParents) {
        if (nameOrSearchParents === void 0) {
            return Metadata.getOwn(CustomElement.name, node);
        }
        if (typeof nameOrSearchParents === 'string') {
            if (searchParents !== true) {
                const controller = Metadata.getOwn(CustomElement.name, node);
                if (controller === void 0) {
                    return (void 0);
                }
                if (controller.is(nameOrSearchParents)) {
                    return controller;
                }
                return (void 0);
            }
            let cur = node;
            while (cur !== null) {
                const controller = Metadata.getOwn(CustomElement.name, cur);
                if (controller !== void 0 && controller.is(nameOrSearchParents)) {
                    return controller;
                }
                cur = DOM.getEffectiveParentNode(cur);
            }
            return (void 0);
        }
        let cur = node;
        while (cur !== null) {
            const controller = Metadata.getOwn(CustomElement.name, cur);
            if (controller !== void 0) {
                return controller;
            }
            cur = DOM.getEffectiveParentNode(cur);
        }
        return (void 0);
    },
    define(nameOrDef, Type) {
        const definition = CustomElementDefinition.create(nameOrDef, Type);
        Metadata.define(CustomElement.name, definition, definition.Type);
        Metadata.define(CustomElement.name, definition, definition);
        Protocol.resource.appendTo(definition.Type, CustomElement.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomElement.name, Type);
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
    generateName: (function () {
        let id = 0;
        return function () {
            return `unnamed-${++id}`;
        };
    })(),
    createInjectable() {
        const $injectable = function (target, property, index) {
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = $injectable;
            return target;
        };
        $injectable.register = function (container) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return {
                resolve(container, requestor) {
                    if (requestor.has($injectable, true)) {
                        return requestor.get($injectable);
                    }
                    else {
                        return null;
                    }
                },
            };
        };
        return $injectable;
    },
    generateType: (function () {
        const nameDescriptor = {
            value: '',
            writable: false,
            enumerable: false,
            configurable: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultProto = {};
        return function (name, proto = defaultProto) {
            // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
            // looking similarly from the outside (when inspected via debugger, etc).
            const Type = class {
            };
            // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
            // even when minified.
            nameDescriptor.value = name;
            Reflect.defineProperty(Type, 'name', nameDescriptor);
            // Assign anything from the prototype that was passed in
            if (proto !== defaultProto) {
                Object.assign(Type.prototype, proto);
            }
            return Type;
        };
    })(),
};
export const IProjectorLocator = DI.createInterface('IProjectorLocator').noDefault();
//# sourceMappingURL=custom-element.js.map