import { DI, Registration, Protocol, Metadata, mergeArrays, fromDefinitionOrDefault, pascalCase, fromAnnotationOrTypeOrDefault, fromAnnotationOrDefinitionOrTypeOrDefault, emptyArray, } from '@aurelia/kernel';
import { registerAliases, } from '@aurelia/runtime';
import { Bindable, } from '../bindable.js';
import { getEffectiveParentNode, getRef } from '../dom.js';
import { Children } from '../templating/children.js';
import { Watch } from '../watch.js';
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
    constructor(Type, name, aliases, key, cache, template, instructions, dependencies, injectable, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, enhance, projectionsMap, watches, processContent) {
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
        this.enhance = enhance;
        this.projectionsMap = projectionsMap;
        this.watches = watches;
        this.processContent = processContent;
    }
    static create(nameOrDef, Type = null) {
        if (Type === null) {
            const def = nameOrDef;
            if (typeof def === 'string') {
                throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
            }
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
            return new CustomElementDefinition(Type, name, mergeArrays(def.aliases), fromDefinitionOrDefault('key', def, () => CustomElement.keyFrom(name)), fromDefinitionOrDefault('cache', def, () => 0), fromDefinitionOrDefault('template', def, () => null), mergeArrays(def.instructions), mergeArrays(def.dependencies), fromDefinitionOrDefault('injectable', def, () => null), fromDefinitionOrDefault('needsCompile', def, () => true), mergeArrays(def.surrogates), Bindable.from(def.bindables), Children.from(def.childrenObservers), fromDefinitionOrDefault('containerless', def, () => false), fromDefinitionOrDefault('isStrictBinding', def, () => false), fromDefinitionOrDefault('shadowOptions', def, () => null), fromDefinitionOrDefault('hasSlots', def, () => false), fromDefinitionOrDefault('enhance', def, () => false), fromDefinitionOrDefault('projectionsMap', def, () => new Map()), fromDefinitionOrDefault('watches', def, () => emptyArray), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // If a type is passed in, we ignore the Type property on the definition if it exists.
        // TODO: document this behavior
        if (typeof nameOrDef === 'string') {
            return new CustomElementDefinition(Type, nameOrDef, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), Type.aliases), CustomElement.keyFrom(nameOrDef), fromAnnotationOrTypeOrDefault('cache', Type, () => 0), fromAnnotationOrTypeOrDefault('template', Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies), fromAnnotationOrTypeOrDefault('injectable', Type, () => null), fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), fromAnnotationOrTypeOrDefault('containerless', Type, () => false), fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), fromAnnotationOrTypeOrDefault('enhance', Type, () => false), fromAnnotationOrTypeOrDefault('projectionsMap', Type, () => new Map()), mergeArrays(Watch.getAnnotation(Type), Type.watches), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
        // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
        // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
        // if this turns out to be too opinionated.
        const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
        return new CustomElementDefinition(Type, name, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), CustomElement.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('projectionsMap', nameOrDef, Type, () => new Map()), mergeArrays(nameOrDef.watches, Watch.getAnnotation(Type), Type.watches), fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, () => null));
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
const defaultForOpts = {
    name: undefined,
    searchParents: false,
    optional: false,
};
export const CustomElement = {
    name: Protocol.resource.keyFor('custom-element'),
    keyFrom(name) {
        return `${CustomElement.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
    },
    for(node, opts = defaultForOpts) {
        if (opts.name === void 0 && opts.searchParents !== true) {
            const controller = getRef(node, CustomElement.name);
            if (controller === null) {
                if (opts.optional === true) {
                    return null;
                }
                throw new Error(`The provided node is not a custom element or containerless host.`);
            }
            return controller;
        }
        if (opts.name !== void 0) {
            if (opts.searchParents !== true) {
                const controller = getRef(node, CustomElement.name);
                if (controller === null) {
                    throw new Error(`The provided node is not a custom element or containerless host.`);
                }
                if (controller.is(opts.name)) {
                    return controller;
                }
                return (void 0);
            }
            let cur = node;
            let foundAController = false;
            while (cur !== null) {
                const controller = getRef(cur, CustomElement.name);
                if (controller !== null) {
                    foundAController = true;
                    if (controller.is(opts.name)) {
                        return controller;
                    }
                }
                cur = getEffectiveParentNode(cur);
            }
            if (foundAController) {
                return (void 0);
            }
            throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
        }
        let cur = node;
        while (cur !== null) {
            const controller = getRef(cur, CustomElement.name);
            if (controller !== null) {
                return controller;
            }
            cur = getEffectiveParentNode(cur);
        }
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
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
const pcHookMetadataProperty = Protocol.annotation.keyFor('processContent');
export function processContent(hook) {
    return hook === void 0
        ? function (target, propertyKey, _descriptor) {
            Metadata.define(pcHookMetadataProperty, ensureHook(target, propertyKey), target);
        }
        : function (target) {
            hook = ensureHook(target, hook);
            const def = Metadata.getOwn(CustomElement.name, target);
            if (def !== void 0) {
                def.processContent = hook;
            }
            else {
                Metadata.define(pcHookMetadataProperty, hook, target);
            }
            return target;
        };
}
function ensureHook(target, hook) {
    if (typeof hook === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        hook = target[hook];
    }
    const hookType = typeof hook;
    if (hookType !== 'function') {
        throw new Error(`Invalid @processContent hook. Expected the hook to be a function (when defined in a class, it needs to be a static function) but got a ${hookType}.`);
    }
    return hook;
}
//# sourceMappingURL=custom-element.js.map