import { camelCase, Registration } from '@aurelia/kernel';
import { BindingMode, CallBindingInstruction, FromViewBindingInstruction, IteratorBindingInstruction, OneTimeBindingInstruction, ToViewBindingInstruction, TwoWayBindingInstruction } from '@aurelia/runtime';
function register(container) {
    const resourceKey = BindingCommandResource.keyFrom(this.description.name);
    container.register(Registration.singleton(resourceKey, this));
}
export function bindingCommand(nameOrDefinition) {
    return target => BindingCommandResource.define(nameOrDefinition, target);
}
function keyFrom(name) {
    return `${this.name}:${name}`;
}
function isType(Type) {
    return Type.kind === this;
}
function define(nameOrDefinition, ctor) {
    const Type = ctor;
    const WritableType = Type;
    const description = typeof nameOrDefinition === 'string' ? { name: nameOrDefinition, target: null } : nameOrDefinition;
    WritableType.kind = BindingCommandResource;
    WritableType.description = description;
    Type.register = register;
    return Type;
}
export const BindingCommandResource = {
    name: 'binding-command',
    keyFrom,
    isType,
    define
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
export function getMode(binding) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.mode;
    }
    else {
        return commandToMode[binding.syntax.command];
    }
}
export class OneTimeBindingCommand {
    constructor() {
        this.bindingType = 49 /* OneTimeCommand */;
    }
    compile(binding) {
        return new OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('one-time', OneTimeBindingCommand);
export class ToViewBindingCommand {
    constructor() {
        this.bindingType = 50 /* ToViewCommand */;
    }
    compile(binding) {
        return new ToViewBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('to-view', ToViewBindingCommand);
export class FromViewBindingCommand {
    constructor() {
        this.bindingType = 51 /* FromViewCommand */;
    }
    compile(binding) {
        return new FromViewBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('from-view', FromViewBindingCommand);
export class TwoWayBindingCommand {
    constructor() {
        this.bindingType = 52 /* TwoWayCommand */;
    }
    compile(binding) {
        return new TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('two-way', TwoWayBindingCommand);
// Not bothering to throw on non-existing modes, should never happen anyway.
// Keeping all array elements of the same type for better optimizeability.
const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
const commandToMode = {
    'bind': BindingMode.toView,
    'one-time': BindingMode.oneTime,
    'to-view': BindingMode.toView,
    'from-view': BindingMode.fromView,
    'two-way': BindingMode.twoWay,
};
export class DefaultBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
        this.$1 = OneTimeBindingCommand.prototype.compile;
        this.$2 = ToViewBindingCommand.prototype.compile;
        this.$4 = FromViewBindingCommand.prototype.compile;
        this.$6 = TwoWayBindingCommand.prototype.compile;
    }
    compile(binding) {
        // @ts-ignore
        return this[modeToProperty[getMode(binding)]](binding);
    }
}
BindingCommandResource.define('bind', DefaultBindingCommand);
export class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    compile(binding) {
        return new CallBindingInstruction(binding.expression, getTarget(binding, true));
    }
}
BindingCommandResource.define('call', CallBindingCommand);
export class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    compile(binding) {
        return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('for', ForBindingCommand);
//# sourceMappingURL=binding-command.js.map