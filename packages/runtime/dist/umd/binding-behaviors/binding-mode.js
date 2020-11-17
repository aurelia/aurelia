var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../observation.js", "../binding-behavior.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TwoWayBindingBehavior = exports.FromViewBindingBehavior = exports.ToViewBindingBehavior = exports.OneTimeBindingBehavior = exports.BindingModeBehavior = void 0;
    const observation_js_1 = require("../observation.js");
    const binding_behavior_js_1 = require("../binding-behavior.js");
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
            this.originalModes = new Map();
        }
        bind(flags, scope, hostScope, binding) {
            this.originalModes.set(binding, binding.mode);
            binding.mode = this.mode;
        }
        unbind(flags, scope, hostScope, binding) {
            binding.mode = this.originalModes.get(binding);
            this.originalModes.delete(binding);
        }
    }
    exports.BindingModeBehavior = BindingModeBehavior;
    let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(observation_js_1.BindingMode.oneTime);
        }
    };
    OneTimeBindingBehavior = __decorate([
        binding_behavior_js_1.bindingBehavior('oneTime')
    ], OneTimeBindingBehavior);
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(observation_js_1.BindingMode.toView);
        }
    };
    ToViewBindingBehavior = __decorate([
        binding_behavior_js_1.bindingBehavior('toView')
    ], ToViewBindingBehavior);
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(observation_js_1.BindingMode.fromView);
        }
    };
    FromViewBindingBehavior = __decorate([
        binding_behavior_js_1.bindingBehavior('fromView')
    ], FromViewBindingBehavior);
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(observation_js_1.BindingMode.twoWay);
        }
    };
    TwoWayBindingBehavior = __decorate([
        binding_behavior_js_1.bindingBehavior('twoWay')
    ], TwoWayBindingBehavior);
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
});
//# sourceMappingURL=binding-mode.js.map