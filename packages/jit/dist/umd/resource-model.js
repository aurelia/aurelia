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
     * A pre-processed piece of information about declared custom elements, attributes and
     * binding commands, optimized for consumption by the template compiler.
     */
    class ResourceModel {
        constructor(resources) {
            this.resources = resources;
            this.elementLookup = {};
            this.attributeLookup = {};
            this.commandLookup = {};
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
                const def = this.resources.find(runtime_1.CustomElement, name);
                if (def == null) {
                    result = null;
                }
                else {
                    result = createElementInfo(def);
                }
                this.elementLookup[name] = result;
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
                const def = this.resources.find(runtime_1.CustomAttribute, syntax.target);
                if (def == null) {
                    result = null;
                }
                else {
                    result = createAttributeInfo(def);
                }
                this.attributeLookup[syntax.target] = result;
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
                result = this.resources.create(binding_command_1.BindingCommandResource, name);
                if (result == null) {
                    // unknown binding command
                    if (optional) {
                        return null;
                    }
                    throw kernel_1.Reporter.error(0); // TODO: create error code
                }
                this.commandLookup[name] = result;
            }
            return result;
        }
    }
    exports.ResourceModel = ResourceModel;
    function createElementInfo(def) {
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
    function createAttributeInfo(def) {
        const info = new AttrInfo(def.name, def.isTemplateController);
        const bindables = def.bindables;
        const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== runtime_1.BindingMode.default
            ? def.defaultBindingMode
            : runtime_1.BindingMode.toView;
        let bindable;
        let prop;
        let mode;
        let bindableCount = 0;
        let hasPrimary = false;
        let isPrimary = false;
        let bindableInfo;
        for (prop in bindables) {
            ++bindableCount;
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
                    throw kernel_1.Reporter.error(0); // todo: error code: primary already exists
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
    /**
     * A pre-processed piece of information about a defined bindable property on a custom
     * element or attribute, optimized for consumption by the template compiler.
     */
    class BindableInfo {
        constructor(propName, mode) {
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
            this.bindables = {};
        }
    }
    exports.ElementInfo = ElementInfo;
    /**
     * Pre-processed information about a custom attribute resource, optimized
     * for consumption by the template compiler.
     */
    class AttrInfo {
        constructor(name, isTemplateController) {
            this.name = name;
            this.bindables = {};
            this.bindable = null;
            this.isTemplateController = isTemplateController;
        }
    }
    exports.AttrInfo = AttrInfo;
});
//# sourceMappingURL=resource-model.js.map