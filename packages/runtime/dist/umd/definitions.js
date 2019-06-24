(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./flags", "./templating/bindable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const flags_1 = require("./flags");
    const bindable_1 = require("./templating/bindable");
    /** @internal */
    exports.customElementName = 'custom-element';
    /** @internal */
    function customElementKey(name) {
        return `${exports.customElementName}:${name}`;
    }
    exports.customElementKey = customElementKey;
    /** @internal */
    function customElementBehavior(node) {
        return node.$controller;
    }
    exports.customElementBehavior = customElementBehavior;
    /** @internal */
    exports.customAttributeName = 'custom-attribute';
    /** @internal */
    function customAttributeKey(name) {
        return `${exports.customAttributeName}:${name}`;
    }
    exports.customAttributeKey = customAttributeKey;
    /**
     * TargetedInstructionType enum values become the property names for the associated renderers when they are injected
     * into the `Renderer`.
     *
     * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
     *
     * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
     * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
     */
    var TargetedInstructionType;
    (function (TargetedInstructionType) {
        TargetedInstructionType["hydrateElement"] = "ra";
        TargetedInstructionType["hydrateAttribute"] = "rb";
        TargetedInstructionType["hydrateTemplateController"] = "rc";
        TargetedInstructionType["hydrateLetElement"] = "rd";
        TargetedInstructionType["setProperty"] = "re";
        TargetedInstructionType["interpolation"] = "rf";
        TargetedInstructionType["propertyBinding"] = "rg";
        TargetedInstructionType["callBinding"] = "rh";
        TargetedInstructionType["letBinding"] = "ri";
        TargetedInstructionType["refBinding"] = "rj";
        TargetedInstructionType["iteratorBinding"] = "rk";
    })(TargetedInstructionType = exports.TargetedInstructionType || (exports.TargetedInstructionType = {}));
    exports.ITargetedInstruction = kernel_1.DI.createInterface('createInterface').noDefault();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isTargetedInstruction = isTargetedInstruction;
    /** @internal */
    exports.buildRequired = Object.freeze({
        required: true,
        compiler: 'default'
    });
    const buildNotRequired = Object.freeze({
        required: false,
        compiler: 'default'
    });
    class HooksDefinition {
        constructor(target) {
            this.hasRender = 'render' in target;
            this.hasCreated = 'created' in target;
            this.hasBinding = 'binding' in target;
            this.hasBound = 'bound' in target;
            this.hasUnbinding = 'unbinding' in target;
            this.hasUnbound = 'unbound' in target;
            this.hasAttaching = 'attaching' in target;
            this.hasAttached = 'attached' in target;
            this.hasDetaching = 'detaching' in target;
            this.hasDetached = 'detached' in target;
            this.hasCaching = 'caching' in target;
        }
    }
    HooksDefinition.none = Object.freeze(new HooksDefinition({}));
    exports.HooksDefinition = HooksDefinition;
    // Note: this is a little perf thing; having one predefined class with the properties always
    // assigned in the same order ensures the browser can keep reusing the same generated hidden
    // class
    class DefaultTemplateDefinition {
        constructor() {
            this.name = 'unnamed';
            this.template = null;
            this.cache = 0;
            this.build = buildNotRequired;
            this.bindables = kernel_1.PLATFORM.emptyObject;
            this.instructions = kernel_1.PLATFORM.emptyArray;
            this.dependencies = kernel_1.PLATFORM.emptyArray;
            this.surrogates = kernel_1.PLATFORM.emptyArray;
            this.containerless = false;
            this.shadowOptions = null;
            this.hasSlots = false;
            this.strategy = 1 /* getterSetter */;
            this.hooks = HooksDefinition.none;
        }
    }
    const templateDefinitionAssignables = [
        'name',
        'template',
        'cache',
        'build',
        'containerless',
        'shadowOptions',
        'hasSlots'
    ];
    const templateDefinitionArrays = [
        'instructions',
        'dependencies',
        'surrogates'
    ];
    // tslint:disable-next-line:parameters-max-number // TODO: Reduce complexity (currently at 64)
    function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots, strategy) {
        const def = new DefaultTemplateDefinition();
        // all cases fall through intentionally
        const argLen = arguments.length;
        switch (argLen) {
            case 13: if (strategy != null)
                def.strategy = flags_1.ensureValidStrategy(strategy);
            case 12: if (hasSlots != null)
                def.hasSlots = hasSlots;
            case 11: if (shadowOptions != null)
                def.shadowOptions = shadowOptions;
            case 10: if (containerless != null)
                def.containerless = containerless;
            case 9: if (surrogates != null)
                def.surrogates = kernel_1.toArray(surrogates);
            case 8: if (dependencies != null)
                def.dependencies = kernel_1.toArray(dependencies);
            case 7: if (instructions != null)
                def.instructions = kernel_1.toArray(instructions);
            case 6: if (bindables != null)
                def.bindables = { ...bindables };
            case 5: if (build != null)
                def.build = build === true ? exports.buildRequired : build === false ? buildNotRequired : { ...build };
            case 4: if (cache != null)
                def.cache = cache;
            case 3: if (template != null)
                def.template = template;
            case 2:
                if (ctor != null) {
                    if (ctor.bindables) {
                        def.bindables = bindable_1.Bindable.for(ctor).get();
                    }
                    if (ctor.containerless) {
                        def.containerless = ctor.containerless;
                    }
                    if (ctor.shadowOptions) {
                        def.shadowOptions = ctor.shadowOptions;
                    }
                    if (ctor.prototype) {
                        def.hooks = new HooksDefinition(ctor.prototype);
                    }
                }
                if (typeof nameOrDef === 'string') {
                    if (nameOrDef.length > 0) {
                        def.name = nameOrDef;
                    }
                }
                else if (nameOrDef != null) {
                    def.strategy = flags_1.ensureValidStrategy(nameOrDef.strategy);
                    templateDefinitionAssignables.forEach(prop => {
                        if (nameOrDef[prop]) {
                            // @ts-ignore // TODO: wait for fix for https://github.com/microsoft/TypeScript/issues/31904
                            def[prop] = nameOrDef[prop];
                        }
                    });
                    templateDefinitionArrays.forEach(prop => {
                        if (nameOrDef[prop]) {
                            // @ts-ignore // TODO: wait for fix for https://github.com/microsoft/TypeScript/issues/31904
                            def[prop] = kernel_1.toArray(nameOrDef[prop]);
                        }
                    });
                    if (nameOrDef['bindables']) {
                        if (def.bindables === kernel_1.PLATFORM.emptyObject) {
                            def.bindables = bindable_1.Bindable.for(nameOrDef).get();
                        }
                        else {
                            Object.assign(def.bindables, nameOrDef.bindables);
                        }
                    }
                }
        }
        // special handling for invocations that quack like a @customElement decorator
        if (argLen === 2 && ctor !== null && (typeof nameOrDef === 'string' || !('build' in nameOrDef))) {
            def.build = exports.buildRequired;
        }
        return def;
    }
    exports.buildTemplateDefinition = buildTemplateDefinition;
});
//# sourceMappingURL=definitions.js.map