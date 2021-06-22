"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefBindingCommand = exports.ClassBindingCommand = exports.StyleBindingCommand = exports.AttrBindingCommand = exports.CaptureBindingCommand = exports.DelegateBindingCommand = exports.TriggerBindingCommand = exports.ForBindingCommand = exports.CallBindingCommand = exports.DefaultBindingCommand = exports.TwoWayBindingCommand = exports.FromViewBindingCommand = exports.ToViewBindingCommand = exports.OneTimeBindingCommand = exports.BindingCommand = exports.BindingCommandDefinition = exports.bindingCommand = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const attribute_mapper_js_1 = require("../attribute-mapper.js");
const renderer_js_1 = require("../renderer.js");
function bindingCommand(nameOrDefinition) {
    return function (target) {
        return exports.BindingCommand.define(nameOrDefinition, target);
    };
}
exports.bindingCommand = bindingCommand;
class BindingCommandDefinition {
    constructor(Type, name, aliases, key, type) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.type = type;
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
        return new BindingCommandDefinition(Type, kernel_1.firstDefined(exports.BindingCommand.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.BindingCommand.keyFrom(name), kernel_1.firstDefined(exports.BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        kernel_1.Registration.singleton(key, Type).register(container);
        kernel_1.Registration.aliasTo(key, Type).register(container);
        runtime_1.registerAliases(aliases, exports.BindingCommand, key, container);
    }
}
exports.BindingCommandDefinition = BindingCommandDefinition;
exports.BindingCommand = {
    name: kernel_1.Protocol.resource.keyFor('binding-command'),
    keyFrom(name) {
        return `${exports.BindingCommand.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.BindingCommand.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        kernel_1.Metadata.define(exports.BindingCommand.name, definition, definition.Type);
        kernel_1.Metadata.define(exports.BindingCommand.name, definition, definition);
        kernel_1.Protocol.resource.appendTo(Type, exports.BindingCommand.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = kernel_1.Metadata.getOwn(exports.BindingCommand.name, Type);
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
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 49 /* OneTimeCommand */;
    }
    static get inject() { return [attribute_mapper_js_1.IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new renderer_js_1.PropertyBindingInstruction(info.expr, target, runtime_1.BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
exports.OneTimeBindingCommand = OneTimeBindingCommand;
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 50 /* ToViewCommand */;
    }
    static get inject() { return [attribute_mapper_js_1.IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new renderer_js_1.PropertyBindingInstruction(info.expr, target, runtime_1.BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
exports.ToViewBindingCommand = ToViewBindingCommand;
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 51 /* FromViewCommand */;
    }
    static get inject() { return [attribute_mapper_js_1.IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new renderer_js_1.PropertyBindingInstruction(info.expr, target, runtime_1.BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
exports.FromViewBindingCommand = FromViewBindingCommand;
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 52 /* TwoWayCommand */;
    }
    static get inject() { return [attribute_mapper_js_1.IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new renderer_js_1.PropertyBindingInstruction(info.expr, target, runtime_1.BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
exports.TwoWayBindingCommand = TwoWayBindingCommand;
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 53 /* BindCommand */;
    }
    static get inject() { return [attribute_mapper_js_1.IAttrMapper]; }
    build(info) {
        var _a;
        const attrName = info.attr.target;
        const bindable = info.bindable;
        let defaultMode;
        let mode;
        let target;
        if (bindable == null) {
            mode = this.m.isTwoWay(info.node, attrName) ? runtime_1.BindingMode.twoWay : runtime_1.BindingMode.toView;
            target = (_a = this.m.map(info.node, attrName)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(attrName);
        }
        else {
            defaultMode = info.def.defaultBindingMode;
            mode = bindable.mode === runtime_1.BindingMode.default || bindable.mode == null
                ? defaultMode == null || defaultMode === runtime_1.BindingMode.default
                    ? runtime_1.BindingMode.toView
                    : defaultMode
                : bindable.mode;
            target = bindable.property;
        }
        return new renderer_js_1.PropertyBindingInstruction(info.expr, target, mode);
    }
};
DefaultBindingCommand = __decorate([
    bindingCommand('bind')
], DefaultBindingCommand);
exports.DefaultBindingCommand = DefaultBindingCommand;
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? kernel_1.camelCase(info.attr.target)
            : info.bindable.property;
        return new renderer_js_1.CallBindingInstruction(info.expr, target);
    }
};
CallBindingCommand = __decorate([
    bindingCommand('call')
], CallBindingCommand);
exports.CallBindingCommand = CallBindingCommand;
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? kernel_1.camelCase(info.attr.target)
            : info.bindable.property;
        return new renderer_js_1.IteratorBindingInstruction(info.expr, target);
    }
};
ForBindingCommand = __decorate([
    bindingCommand('for')
], ForBindingCommand);
exports.ForBindingCommand = ForBindingCommand;
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    build(info) {
        return new renderer_js_1.ListenerBindingInstruction(info.expr, info.attr.target, true, runtime_1.DelegationStrategy.none);
    }
};
TriggerBindingCommand = __decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
exports.TriggerBindingCommand = TriggerBindingCommand;
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    build(info) {
        return new renderer_js_1.ListenerBindingInstruction(info.expr, info.attr.target, false, runtime_1.DelegationStrategy.bubbling);
    }
};
DelegateBindingCommand = __decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
exports.DelegateBindingCommand = DelegateBindingCommand;
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    build(info) {
        return new renderer_js_1.ListenerBindingInstruction(info.expr, info.attr.target, false, runtime_1.DelegationStrategy.capturing);
    }
};
CaptureBindingCommand = __decorate([
    bindingCommand('capture')
], CaptureBindingCommand);
exports.CaptureBindingCommand = CaptureBindingCommand;
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new renderer_js_1.AttributeBindingInstruction(info.attr.target, info.expr, info.attr.target);
    }
};
AttrBindingCommand = __decorate([
    bindingCommand('attr')
], AttrBindingCommand);
exports.AttrBindingCommand = AttrBindingCommand;
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new renderer_js_1.AttributeBindingInstruction('style', info.expr, info.attr.target);
    }
};
StyleBindingCommand = __decorate([
    bindingCommand('style')
], StyleBindingCommand);
exports.StyleBindingCommand = StyleBindingCommand;
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new renderer_js_1.AttributeBindingInstruction('class', info.expr, info.attr.target);
    }
};
ClassBindingCommand = __decorate([
    bindingCommand('class')
], ClassBindingCommand);
exports.ClassBindingCommand = ClassBindingCommand;
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
let RefBindingCommand = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new renderer_js_1.RefBindingInstruction(info.expr, info.attr.target);
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);
exports.RefBindingCommand = RefBindingCommand;
//# sourceMappingURL=binding-command.js.map