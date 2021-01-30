var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { camelCase, Registration, mergeArrays, Protocol, firstDefined, Metadata } from '../../../../kernel/dist/native-modules/index.js';
import { BindingMode, DelegationStrategy, registerAliases } from '../../../../runtime/dist/native-modules/index.js';
import { AttributeBindingInstruction, PropertyBindingInstruction, CallBindingInstruction, IteratorBindingInstruction, RefBindingInstruction, ListenerBindingInstruction, } from '../renderer.js';
import { BindingSymbol } from '../semantic-model.js';
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
export function getTarget(binding, makeCamelCase) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.propName;
    }
    else if (makeCamelCase) {
        return camelCase(binding.syntax.target);
    }
    else {
        return binding.syntax.target;
    }
}
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor() {
        this.bindingType = 49 /* OneTimeCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
export { OneTimeBindingCommand };
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor() {
        this.bindingType = 50 /* ToViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
export { ToViewBindingCommand };
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor() {
        this.bindingType = 51 /* FromViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
export { FromViewBindingCommand };
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor() {
        this.bindingType = 52 /* TwoWayCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
export { TwoWayBindingCommand };
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        let mode = BindingMode.default;
        if (binding instanceof BindingSymbol) {
            mode = binding.bindable.mode;
        }
        else {
            const command = binding.syntax.command;
            switch (command) {
                case 'bind':
                case 'to-view':
                    mode = BindingMode.toView;
                    break;
                case 'one-time':
                    mode = BindingMode.oneTime;
                    break;
                case 'from-view':
                    mode = BindingMode.fromView;
                    break;
                case 'two-way':
                    mode = BindingMode.twoWay;
                    break;
            }
        }
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), mode === BindingMode.default ? BindingMode.toView : mode);
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
    compile(binding) {
        return new CallBindingInstruction(binding.expression, getTarget(binding, true));
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
    compile(binding) {
        return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
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
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), true, DelegationStrategy.none);
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
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.bubbling);
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
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.capturing);
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
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
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
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
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
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
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
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreCustomAttr */;
    }
    compile(binding) {
        return new RefBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);
export { RefBindingCommand };
//# sourceMappingURL=binding-command.js.map