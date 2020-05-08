var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../flags", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const flags_1 = require("../../flags");
    const binding_behavior_1 = require("../binding-behavior");
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
            this.originalModes = new WeakMap();
        }
        bind(flags, scope, binding) {
            this.originalModes.set(binding, binding.mode);
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = this.originalModes.get(binding);
        }
    }
    exports.BindingModeBehavior = BindingModeBehavior;
    let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.oneTime);
        }
    };
    OneTimeBindingBehavior = __decorate([
        binding_behavior_1.bindingBehavior('oneTime'),
        __metadata("design:paramtypes", [])
    ], OneTimeBindingBehavior);
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.toView);
        }
    };
    ToViewBindingBehavior = __decorate([
        binding_behavior_1.bindingBehavior('toView'),
        __metadata("design:paramtypes", [])
    ], ToViewBindingBehavior);
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.fromView);
        }
    };
    FromViewBindingBehavior = __decorate([
        binding_behavior_1.bindingBehavior('fromView'),
        __metadata("design:paramtypes", [])
    ], FromViewBindingBehavior);
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.twoWay);
        }
    };
    TwoWayBindingBehavior = __decorate([
        binding_behavior_1.bindingBehavior('twoWay'),
        __metadata("design:paramtypes", [])
    ], TwoWayBindingBehavior);
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
});
//# sourceMappingURL=binding-mode.js.map