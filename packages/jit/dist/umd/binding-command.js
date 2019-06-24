(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    function register(container) {
        const resourceKey = exports.BindingCommandResource.keyFrom(this.description.name);
        container.register(kernel_1.Registration.singleton(resourceKey, this));
    }
    function bindingCommand(nameOrDefinition) {
        return target => exports.BindingCommandResource.define(nameOrDefinition, target);
    }
    exports.bindingCommand = bindingCommand;
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
        WritableType.kind = exports.BindingCommandResource;
        WritableType.description = description;
        Type.register = register;
        return Type;
    }
    exports.BindingCommandResource = {
        name: 'binding-command',
        keyFrom,
        isType,
        define
    };
    function getTarget(binding, makeCamelCase) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.propName;
        }
        else if (makeCamelCase) {
            return kernel_1.camelCase(binding.syntax.target);
        }
        else {
            return binding.syntax.target;
        }
    }
    exports.getTarget = getTarget;
    function getMode(binding) {
        if (binding.flags & 256 /* isBinding */) {
            return binding.bindable.mode;
        }
        else {
            return commandToMode[binding.syntax.command];
        }
    }
    exports.getMode = getMode;
    class OneTimeBindingCommand {
        constructor() {
            this.bindingType = 49 /* OneTimeCommand */;
        }
        compile(binding) {
            return new runtime_1.OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    exports.OneTimeBindingCommand = OneTimeBindingCommand;
    exports.BindingCommandResource.define('one-time', OneTimeBindingCommand);
    class ToViewBindingCommand {
        constructor() {
            this.bindingType = 50 /* ToViewCommand */;
        }
        compile(binding) {
            return new runtime_1.ToViewBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    exports.ToViewBindingCommand = ToViewBindingCommand;
    exports.BindingCommandResource.define('to-view', ToViewBindingCommand);
    class FromViewBindingCommand {
        constructor() {
            this.bindingType = 51 /* FromViewCommand */;
        }
        compile(binding) {
            return new runtime_1.FromViewBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    exports.FromViewBindingCommand = FromViewBindingCommand;
    exports.BindingCommandResource.define('from-view', FromViewBindingCommand);
    class TwoWayBindingCommand {
        constructor() {
            this.bindingType = 52 /* TwoWayCommand */;
        }
        compile(binding) {
            return new runtime_1.TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    exports.TwoWayBindingCommand = TwoWayBindingCommand;
    exports.BindingCommandResource.define('two-way', TwoWayBindingCommand);
    // Not bothering to throw on non-existing modes, should never happen anyway.
    // Keeping all array elements of the same type for better optimizeability.
    const modeToProperty = ['', '$1', '$2', '', '$4', '', '$6'];
    const commandToMode = {
        'bind': runtime_1.BindingMode.toView,
        'one-time': runtime_1.BindingMode.oneTime,
        'to-view': runtime_1.BindingMode.toView,
        'from-view': runtime_1.BindingMode.fromView,
        'two-way': runtime_1.BindingMode.twoWay,
    };
    class DefaultBindingCommand {
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
    exports.DefaultBindingCommand = DefaultBindingCommand;
    exports.BindingCommandResource.define('bind', DefaultBindingCommand);
    class CallBindingCommand {
        constructor() {
            this.bindingType = 153 /* CallCommand */;
        }
        compile(binding) {
            return new runtime_1.CallBindingInstruction(binding.expression, getTarget(binding, true));
        }
    }
    exports.CallBindingCommand = CallBindingCommand;
    exports.BindingCommandResource.define('call', CallBindingCommand);
    class ForBindingCommand {
        constructor() {
            this.bindingType = 539 /* ForCommand */;
        }
        compile(binding) {
            return new runtime_1.IteratorBindingInstruction(binding.expression, getTarget(binding, false));
        }
    }
    exports.ForBindingCommand = ForBindingCommand;
    exports.BindingCommandResource.define('for', ForBindingCommand);
});
//# sourceMappingURL=binding-command.js.map