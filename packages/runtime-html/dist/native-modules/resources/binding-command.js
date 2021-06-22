var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { camelCase, Registration, mergeArrays, Protocol, firstDefined, Metadata } from '../../../../kernel/dist/native-modules/index.js';
import { BindingMode, DelegationStrategy, registerAliases } from '../../../../runtime/dist/native-modules/index.js';
import { IAttrSyntaxTransformer } from '../attribute-syntax-transformer.js';
import { AttributeBindingInstruction, PropertyBindingInstruction, CallBindingInstruction, IteratorBindingInstruction, RefBindingInstruction, ListenerBindingInstruction, } from '../renderer.js';
export function bindingCommand(nameOrDefinition) {
    return function (target) {
        return BindingCommand.define(nameOrDefinition, target);
    };
}
export class BindingCommandDefinition {
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
        return new BindingCommandDefinition(Type, firstDefined(BindingCommand.getAnnotation(Type, 'name'), name), mergeArrays(BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingCommand.keyFrom(name), firstDefined(BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingCommand, key, container);
    }
}
export const BindingCommand = {
    name: Protocol.resource.keyFor('binding-command'),
    keyFrom(name) {
        return `${BindingCommand.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingCommand.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        Metadata.define(BindingCommand.name, definition, definition.Type);
        Metadata.define(BindingCommand.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingCommand.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingCommand.name, Type);
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
};
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(t) {
        this.t = t;
        this.bindingType = 49 /* OneTimeCommand */;
    }
    static get inject() { return [IAttrSyntaxTransformer]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.t.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
export { OneTimeBindingCommand };
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor(t) {
        this.t = t;
        this.bindingType = 50 /* ToViewCommand */;
    }
    static get inject() { return [IAttrSyntaxTransformer]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.t.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
export { ToViewBindingCommand };
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor(t) {
        this.t = t;
        this.bindingType = 51 /* FromViewCommand */;
    }
    static get inject() { return [IAttrSyntaxTransformer]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.t.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
export { FromViewBindingCommand };
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(t) {
        this.t = t;
        this.bindingType = 52 /* TwoWayCommand */;
    }
    static get inject() { return [IAttrSyntaxTransformer]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.t.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
export { TwoWayBindingCommand };
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor(t) {
        this.t = t;
        this.bindingType = 53 /* BindCommand */;
    }
    static get inject() { return [IAttrSyntaxTransformer]; }
    build(info) {
        var _a;
        const attrName = info.attr.target;
        const bindable = info.bindable;
        let defaultMode;
        let mode;
        let target;
        if (bindable == null) {
            mode = this.t.isTwoWay(info.node, attrName) ? BindingMode.twoWay : BindingMode.toView;
            target = (_a = this.t.map(info.node, attrName)) !== null && _a !== void 0 ? _a : camelCase(attrName);
        }
        else {
            defaultMode = info.def.defaultBindingMode;
            mode = bindable.mode === BindingMode.default || bindable.mode == null
                ? defaultMode == null || defaultMode === BindingMode.default
                    ? BindingMode.toView
                    : defaultMode
                : bindable.mode;
            target = bindable.property;
        }
        return new PropertyBindingInstruction(info.expr, target, mode);
    }
};
DefaultBindingCommand = __decorate([
    bindingCommand('bind')
], DefaultBindingCommand);
export { DefaultBindingCommand };
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.property;
        return new CallBindingInstruction(info.expr, target);
    }
};
CallBindingCommand = __decorate([
    bindingCommand('call')
], CallBindingCommand);
export { CallBindingCommand };
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    build(info) {
        const target = info.bindable === null
            ? camelCase(info.attr.target)
            : info.bindable.property;
        return new IteratorBindingInstruction(info.expr, target);
    }
};
ForBindingCommand = __decorate([
    bindingCommand('for')
], ForBindingCommand);
export { ForBindingCommand };
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, true, DelegationStrategy.none);
    }
};
TriggerBindingCommand = __decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
export { TriggerBindingCommand };
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, false, DelegationStrategy.bubbling);
    }
};
DelegateBindingCommand = __decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
export { DelegateBindingCommand };
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    build(info) {
        return new ListenerBindingInstruction(info.expr, info.attr.target, false, DelegationStrategy.capturing);
    }
};
CaptureBindingCommand = __decorate([
    bindingCommand('capture')
], CaptureBindingCommand);
export { CaptureBindingCommand };
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction(info.attr.target, info.expr, info.attr.target);
    }
};
AttrBindingCommand = __decorate([
    bindingCommand('attr')
], AttrBindingCommand);
export { AttrBindingCommand };
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction('style', info.expr, info.attr.target);
    }
};
StyleBindingCommand = __decorate([
    bindingCommand('style')
], StyleBindingCommand);
export { StyleBindingCommand };
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new AttributeBindingInstruction('class', info.expr, info.attr.target);
    }
};
ClassBindingCommand = __decorate([
    bindingCommand('class')
], ClassBindingCommand);
export { ClassBindingCommand };
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
let RefBindingCommand = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    build(info) {
        return new RefBindingInstruction(info.expr, info.attr.target);
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);
export { RefBindingCommand };
//# sourceMappingURL=binding-command.js.map