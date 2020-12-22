"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalBindingBehavior = void 0;
const runtime_1 = require("@aurelia/runtime");
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
    __param(0, runtime_1.ISignaler)
], SignalBindingBehavior);
exports.SignalBindingBehavior = SignalBindingBehavior;
runtime_1.bindingBehavior('signal')(SignalBindingBehavior);
//# sourceMappingURL=signals.js.map