(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./binding-command"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const binding_command_1 = require("./binding-command");
    /**
     * A pre-processed piece of information about a defined bindable property on a custom
     * element or attribute, optimized for consumption by the template compiler.
     */
    class BindableInfo {
        constructor(
        /**
         * The pre-processed *property* (not attribute) name of the bindable, which is
         * (in order of priority):
         *
         * 1. The `property` from the description (if defined)
         * 2. The name of the property of the bindable itself
         */
        propName, 
        /**
         * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
         *
         * 1. The `mode` from the bindable (if defined and not bindingMode.default)
         * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
         * 3. `bindingMode.toView`
         */
        mode) {
            this.propName = propName;
            this.mode = mode;
        }
    }
    exports.BindableInfo = BindableInfo;
    /**
     * Pre-processed information about a custom element resource, optimized
     * for consumption by the template compiler.
     */
    class ElementInfo {
        constructor(name, containerless) {
            this.name = name;
            this.containerless = containerless;
            /**
             * A lookup of the bindables of this element, indexed by the (pre-processed)
             * attribute names as they would be found in parsed markup.
             */
            this.bindables = Object.create(null);
        }
        static from(def) {
            const info = new ElementInfo(def.name, def.containerless);
            const bindables = def.bindables;
            const defaultBindingMode = runtime_1.BindingMode.toView;
            let bindable;
            let prop;
            let attr;
            let mode;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                // explicitly provided attribute name has priority over the derived implicit attribute name
                if (bindable.attribute !== void 0) {
                    attr = bindable.attribute;
                }
                else {
                    // derive the attribute name from the resolved property name
                    attr = kernel_1.kebabCase(prop);
                }
                if (bindable.mode !== void 0 && bindable.mode !== runtime_1.BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                info.bindables[attr] = new BindableInfo(prop, mode);
            }
            return info;
        }
    }
    exports.ElementInfo = ElementInfo;
    /**
     * Pre-processed information about a custom attribute resource, optimized
     * for consumption by the template compiler.
     */
    class AttrInfo {
        constructor(name, isTemplateController, noMultiBindings) {
            this.name = name;
            this.isTemplateController = isTemplateController;
            this.noMultiBindings = noMultiBindings;
            /**
             * A lookup of the bindables of this attribute, indexed by the (pre-processed)
             * bindable names as they would be found in the attribute value.
             *
             * Only applicable to multi attribute bindings (semicolon-separated).
             */
            this.bindables = Object.create(null);
            /**
             * The single or first bindable of this attribute, or a default 'value'
             * bindable if no bindables were defined on the attribute.
             *
             * Only applicable to single attribute bindings (where the attribute value
             * contains no semicolons)
             */
            this.bindable = null;
        }
        static from(def) {
            const info = new AttrInfo(def.name, def.isTemplateController, def.noMultiBindings);
            const bindables = def.bindables;
            const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== runtime_1.BindingMode.default
                ? def.defaultBindingMode
                : runtime_1.BindingMode.toView;
            let bindable;
            let prop;
            let mode;
            let hasPrimary = false;
            let isPrimary = false;
            let bindableInfo;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                if (bindable.mode !== void 0 && bindable.mode !== runtime_1.BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                isPrimary = bindable.primary === true;
                bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                if (isPrimary) {
                    if (hasPrimary) {
                        throw new Error('primary already exists');
                    }
                    hasPrimary = true;
                    info.bindable = bindableInfo;
                }
                // set to first bindable by convention
                if (info.bindable === null) {
                    info.bindable = bindableInfo;
                }
            }
            // if no bindables are present, default to "value"
            if (info.bindable === null) {
                info.bindable = new BindableInfo('value', defaultBindingMode);
            }
            return info;
        }
    }
    exports.AttrInfo = AttrInfo;
    const contextLookup = new WeakMap();
    /**
     * A pre-processed piece of information about declared custom elements, attributes and
     * binding commands, optimized for consumption by the template compiler.
     */
    class ResourceModel {
        constructor(container) {
            this.elementLookup = Object.create(null);
            this.attributeLookup = Object.create(null);
            this.commandLookup = Object.create(null);
            // Note: don't do this sort of thing elsewhere, this is purely for perf reasons
            this.container = container;
            const rootContainer = container.root;
            this.resourceResolvers = container.resourceResolvers;
            this.rootResourceResolvers = rootContainer.resourceResolvers;
        }
        static getOrCreate(context) {
            let model = contextLookup.get(context);
            if (model === void 0) {
                contextLookup.set(context, model = new ResourceModel(context));
            }
            return model;
        }
        /**
         * Retrieve information about a custom element resource.
         *
         * @param element - The original DOM element.
         *
         * @returns The resource information if the element exists, or `null` if it does not exist.
         */
        getElementInfo(name) {
            let result = this.elementLookup[name];
            if (result === void 0) {
                const def = this.find(runtime_1.CustomElement, name);
                this.elementLookup[name] = result = def === null ? null : ElementInfo.from(def);
            }
            return result;
        }
        /**
         * Retrieve information about a custom attribute resource.
         *
         * @param syntax - The parsed `AttrSyntax`
         *
         * @returns The resource information if the attribute exists, or `null` if it does not exist.
         */
        getAttributeInfo(syntax) {
            let result = this.attributeLookup[syntax.target];
            if (result === void 0) {
                const def = this.find(runtime_1.CustomAttribute, syntax.target);
                this.attributeLookup[syntax.target] = result = def === null ? null : AttrInfo.from(def);
            }
            return result;
        }
        /**
         * Retrieve a binding command resource.
         *
         * @param name - The parsed `AttrSyntax`
         *
         * @returns An instance of the command if it exists, or `null` if it does not exist.
         */
        getBindingCommand(syntax, optional) {
            const name = syntax.command;
            if (name === null) {
                return null;
            }
            let result = this.commandLookup[name];
            if (result === void 0) {
                result = this.create(binding_command_1.BindingCommand, name);
                if (result === null) {
                    if (optional) {
                        return null;
                    }
                    throw new Error(`Unknown binding command: ${name}`);
                }
                this.commandLookup[name] = result;
            }
            return result;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            let resolver = this.resourceResolvers[key];
            if (resolver === void 0) {
                resolver = this.rootResourceResolvers[key];
                if (resolver === void 0) {
                    return null;
                }
            }
            if (resolver === null) {
                return null;
            }
            if (typeof resolver.getFactory === 'function') {
                const factory = resolver.getFactory(this.container);
                if (factory === null || factory === void 0) {
                    return null;
                }
                const definition = kernel_1.Metadata.getOwn(kind.name, factory.Type);
                if (definition === void 0) {
                    // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
                    // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
                    return null;
                }
                return definition;
            }
            return null;
        }
        create(kind, name) {
            const key = kind.keyFrom(name);
            let resolver = this.resourceResolvers[key];
            if (resolver === void 0) {
                resolver = this.rootResourceResolvers[key];
                if (resolver === void 0) {
                    return null;
                }
            }
            if (resolver === null) {
                return null;
            }
            const instance = resolver.resolve(this.container, this.container);
            if (instance === void 0) {
                return null;
            }
            return instance;
        }
    }
    exports.ResourceModel = ResourceModel;
});
//# sourceMappingURL=resource-model.js.map