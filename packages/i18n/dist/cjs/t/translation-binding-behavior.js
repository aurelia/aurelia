"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationBindingBehavior = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
let TranslationBindingBehavior = class TranslationBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        const expression = binding.sourceExpression.expression;
        if (!(expression instanceof runtime_html_1.ValueConverterExpression)) {
            const vcExpression = new runtime_html_1.ValueConverterExpression(expression, "t" /* translationValueConverterName */, binding.sourceExpression.args);
            binding.sourceExpression.expression = vcExpression;
        }
    }
};
TranslationBindingBehavior = __decorate([
    runtime_html_1.bindingBehavior("t" /* translationValueConverterName */)
], TranslationBindingBehavior);
exports.TranslationBindingBehavior = TranslationBindingBehavior;
//# sourceMappingURL=translation-binding-behavior.js.map