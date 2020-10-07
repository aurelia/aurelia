var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../observation/signaler", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SignalBindingBehavior = void 0;
    const signaler_1 = require("../../observation/signaler");
    const binding_behavior_1 = require("../binding-behavior");
    let SignalBindingBehavior = class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
            this.lookup = new Map();
        }
        bind(flags, scope, hostScope, binding, ...names) {
            if (!('handleChange' in binding)) {
                throw new Error(`The signal behavior can only be used with bindings that have a 'handleChange' method`);
            }
            if (names.length === 0) {
                throw new Error(`At least one signal name must be passed to the signal behavior, e.g. \`expr & signal:'my-signal'\``);
            }
            this.lookup.set(binding, names);
            for (const name of names) {
                this.signaler.addSignalListener(name, binding);
            }
        }
        unbind(flags, scope, hostScope, binding) {
            const names = this.lookup.get(binding);
            this.lookup.delete(binding);
            for (const name of names) {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    };
    SignalBindingBehavior = __decorate([
        binding_behavior_1.bindingBehavior('signal'),
        __param(0, signaler_1.ISignaler),
        __metadata("design:paramtypes", [Object])
    ], SignalBindingBehavior);
    exports.SignalBindingBehavior = SignalBindingBehavior;
});
//# sourceMappingURL=signals.js.map