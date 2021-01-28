"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAttribute = exports.CustomAttributeDefinition = exports.templateController = exports.customAttribute = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const bindable_js_1 = require("../bindable.js");
const watch_js_1 = require("../watch.js");
const dom_js_1 = require("../dom.js");
function customAttribute(nameOrDef) {
    return function (target) {
        return exports.CustomAttribute.define(nameOrDef, target);
    };
}
exports.customAttribute = customAttribute;
function templateController(nameOrDef) {
    return function (target) {
        return exports.CustomAttribute.define(typeof nameOrDef === 'string'
            ? { isTemplateController: true, name: nameOrDef }
            : { isTemplateController: true, ...nameOrDef }, target);
    };
}
exports.templateController = templateController;
class CustomAttributeDefinition {
    constructor(Type, name, aliases, key, defaultBindingMode, isTemplateController, bindables, noMultiBindings, watches) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.defaultBindingMode = defaultBindingMode;
        this.isTemplateController = isTemplateController;
        this.bindables = bindables;
        this.noMultiBindings = noMultiBindings;
        this.watches = watches;
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
        return new CustomAttributeDefinition(Type, kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.CustomAttribute.keyFrom(name), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, runtime_1.BindingMode.toView), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), bindable_js_1.Bindable.from(...bindable_js_1.Bindable.getAll(Type), exports.CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), kernel_1.firstDefined(exports.CustomAttribute.getAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false), kernel_1.mergeArrays(watch_js_1.Watch.getAnnotation(Type), Type.watches));
    }
    register(container) {
        const { Type, key, aliases } = this;
        kernel_1.Registration.transient(key, Type).register(container);
        kernel_1.Registration.aliasTo(key, Type).register(container);
        runtime_1.registerAliases(aliases, exports.CustomAttribute, key, container);
    }
}
exports.CustomAttributeDefinition = CustomAttributeDefinition;
exports.CustomAttribute = {
    name: kernel_1.Protocol.resource.keyFor('custom-attribute'),
    keyFrom(name) {
        return `${exports.CustomAttribute.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.CustomAttribute.name, value);
    },
    for(node, name) {
        var _a;
        return ((_a = dom_js_1.getRef(node, exports.CustomAttribute.keyFrom(name))) !== null && _a !== void 0 ? _a : void 0);
    },
    define(nameOrDef, Type) {
        const definition = CustomAttributeDefinition.create(nameOrDef, Type);
        kernel_1.Metadata.define(exports.CustomAttribute.name, definition, definition.Type);
        kernel_1.Metadata.define(exports.CustomAttribute.name, definition, definition);
        kernel_1.Protocol.resource.appendTo(Type, exports.CustomAttribute.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = kernel_1.Metadata.getOwn(exports.CustomAttribute.name, Type);
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
};
//# sourceMappingURL=custom-attribute.js.map