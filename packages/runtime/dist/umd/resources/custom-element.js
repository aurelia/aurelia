(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../definitions", "../templating/bindable", "../templating/children"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../definitions");
    const bindable_1 = require("../templating/bindable");
    const children_1 = require("../templating/children");
    function customElement(nameOrDef) {
        return function (target) {
            return exports.CustomElement.define(nameOrDef, target);
        };
    }
    exports.customElement = customElement;
    function useShadowDOM(targetOrOptions) {
        if (targetOrOptions === void 0) {
            return function ($target) {
                exports.CustomElement.annotate($target, 'shadowOptions', { mode: 'open' });
            };
        }
        if (typeof targetOrOptions !== 'function') {
            return function ($target) {
                exports.CustomElement.annotate($target, 'shadowOptions', targetOrOptions);
            };
        }
        exports.CustomElement.annotate(targetOrOptions, 'shadowOptions', { mode: 'open' });
    }
    exports.useShadowDOM = useShadowDOM;
    function containerless(target) {
        if (target === void 0) {
            return function ($target) {
                exports.CustomElement.annotate($target, 'containerless', true);
            };
        }
        exports.CustomElement.annotate(target, 'containerless', true);
    }
    exports.containerless = containerless;
    function strict(target) {
        if (target === void 0) {
            return function ($target) {
                exports.CustomElement.annotate($target, 'isStrictBinding', true);
            };
        }
        exports.CustomElement.annotate(target, 'isStrictBinding', true);
    }
    exports.strict = strict;
    class CustomElementDefinition {
        constructor(Type, name, aliases, key, cache, template, instructions, dependencies, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, strategy, hooks, scopeParts) {
            this.Type = Type;
            this.name = name;
            this.aliases = aliases;
            this.key = key;
            this.cache = cache;
            this.template = template;
            this.instructions = instructions;
            this.dependencies = dependencies;
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
                const name = kernel_1.fromDefinitionOrDefault('name', def, exports.CustomElement.generateName);
                if (typeof def.Type === 'function') {
                    // This needs to be a clone (it will usually be the compiler calling this signature)
                    // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
                    // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
                    Type = def.Type;
                }
                else {
                    Type = exports.CustomElement.generateType(kernel_1.pascalCase(name));
                }
                return new CustomElementDefinition(Type, name, kernel_1.mergeArrays(def.aliases), kernel_1.fromDefinitionOrDefault('key', def, () => exports.CustomElement.keyFrom(name)), kernel_1.fromDefinitionOrDefault('cache', def, () => 0), kernel_1.fromDefinitionOrDefault('template', def, () => null), kernel_1.mergeArrays(def.instructions), kernel_1.mergeArrays(def.dependencies), kernel_1.fromDefinitionOrDefault('needsCompile', def, () => true), kernel_1.mergeArrays(def.surrogates), bindable_1.Bindable.from(def.bindables), children_1.Children.from(def.childrenObservers), kernel_1.fromDefinitionOrDefault('containerless', def, () => false), kernel_1.fromDefinitionOrDefault('isStrictBinding', def, () => false), kernel_1.fromDefinitionOrDefault('shadowOptions', def, () => null), kernel_1.fromDefinitionOrDefault('hasSlots', def, () => false), kernel_1.fromDefinitionOrDefault('strategy', def, () => 1 /* getterSetter */), kernel_1.fromDefinitionOrDefault('hooks', def, () => definitions_1.HooksDefinition.none), kernel_1.mergeArrays(def.scopeParts));
            }
            // If a type is passed in, we ignore the Type property on the definition if it exists.
            // TODO: document this behavior
            if (typeof nameOrDef === 'string') {
                return new CustomElementDefinition(Type, nameOrDef, kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'aliases'), Type.aliases), exports.CustomElement.keyFrom(nameOrDef), kernel_1.fromAnnotationOrTypeOrDefault('cache', Type, () => 0), kernel_1.fromAnnotationOrTypeOrDefault('template', Type, () => null), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'instructions'), Type.instructions), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies), kernel_1.fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates), bindable_1.Bindable.from(...bindable_1.Bindable.getAll(Type), exports.CustomElement.getAnnotation(Type, 'bindables'), Type.bindables), children_1.Children.from(...children_1.Children.getAll(Type), exports.CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), kernel_1.fromAnnotationOrTypeOrDefault('containerless', Type, () => false), kernel_1.fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), kernel_1.fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), kernel_1.fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), kernel_1.fromAnnotationOrTypeOrDefault('strategy', Type, () => 1 /* getterSetter */), 
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                kernel_1.fromAnnotationOrTypeOrDefault('hooks', Type, () => new definitions_1.HooksDefinition(Type.prototype)), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'scopeParts'), Type.scopeParts));
            }
            // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
            // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
            // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
            // if this turns out to be too opinionated.
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const name = kernel_1.fromDefinitionOrDefault('name', nameOrDef, exports.CustomElement.generateName);
            return new CustomElementDefinition(Type, name, kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), exports.CustomElement.keyFrom(name), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), bindable_1.Bindable.from(...bindable_1.Bindable.getAll(Type), exports.CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), children_1.Children.from(...children_1.Children.getAll(Type), exports.CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('strategy', nameOrDef, Type, () => 1 /* getterSetter */), 
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            kernel_1.fromAnnotationOrTypeOrDefault('hooks', Type, () => new definitions_1.HooksDefinition(Type.prototype)), kernel_1.mergeArrays(exports.CustomElement.getAnnotation(Type, 'scopeParts'), nameOrDef.scopeParts, Type.scopeParts));
        }
        register(container) {
            const { Type, key, aliases } = this;
            kernel_1.Registration.transient(key, Type).register(container);
            kernel_1.Registration.alias(key, Type).register(container);
            definitions_1.registerAliases(aliases, exports.CustomElement, key, container);
        }
    }
    exports.CustomElementDefinition = CustomElementDefinition;
    exports.CustomElement = {
        name: kernel_1.Protocol.resource.keyFor('custom-element'),
        keyFrom(name) {
            return `${exports.CustomElement.name}:${name}`;
        },
        isType(value) {
            return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.CustomElement.name, value);
        },
        behaviorFor(node) {
            return node.$controller;
        },
        define(nameOrDef, Type) {
            const definition = CustomElementDefinition.create(nameOrDef, Type);
            kernel_1.Metadata.define(exports.CustomElement.name, definition, definition.Type);
            kernel_1.Metadata.define(exports.CustomElement.name, definition, definition);
            kernel_1.Protocol.resource.appendTo(definition.Type, exports.CustomElement.name);
            return definition.Type;
        },
        getDefinition(Type) {
            const def = kernel_1.Metadata.getOwn(exports.CustomElement.name, Type);
            if (def === void 0) {
                throw new Error(`No definition found for type ${Type.name}`);
            }
            return def;
        },
        annotate(Type, prop, value) {
            kernel_1.Metadata.define(kernel_1.Protocol.annotation.keyFor(prop), value, Type);
        },
        getAnnotation(Type, prop) {
            return kernel_1.Metadata.getOwn(kernel_1.Protocol.annotation.keyFor(prop), Type);
        },
        generateName: (function () {
            let id = 0;
            return function () {
                return `unnamed-${++id}`;
            };
        })(),
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
    exports.IProjectorLocator = kernel_1.DI.createInterface('IProjectorLocator').noDefault();
});
//# sourceMappingURL=custom-element.js.map