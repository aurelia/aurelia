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
exports.TranslationParametersBindingRenderer = exports.TranslationParametersBindingCommand = exports.TranslationParametersBindingInstruction = exports.TranslationParametersAttributePattern = exports.TranslationParametersInstructionType = void 0;
const kernel_1 = require("@aurelia/kernel");
const translation_binding_js_1 = require("./translation-binding.js");
const runtime_html_1 = require("@aurelia/runtime-html");
exports.TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';
let TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
    [attribute](rawName, rawValue, parts) {
        return new runtime_html_1.AttrSyntax(rawName, rawValue, '', attribute);
    }
};
TranslationParametersAttributePattern = __decorate([
    runtime_html_1.attributePattern({ pattern: attribute, symbols: '' })
], TranslationParametersAttributePattern);
exports.TranslationParametersAttributePattern = TranslationParametersAttributePattern;
class TranslationParametersBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = exports.TranslationParametersInstructionType;
        this.mode = runtime_html_1.BindingMode.toView;
    }
}
exports.TranslationParametersBindingInstruction = TranslationParametersBindingInstruction;
let TranslationParametersBindingCommand = class TranslationParametersBindingCommand {
    constructor(m) {
        this.m = m;
        this.bindingType = 53 /* BindCommand */;
    }
    static get inject() { return [runtime_html_1.IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new TranslationParametersBindingInstruction(info.expr, target);
    }
};
TranslationParametersBindingCommand = __decorate([
    runtime_html_1.bindingCommand(attribute)
], TranslationParametersBindingCommand);
exports.TranslationParametersBindingCommand = TranslationParametersBindingCommand;
let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        translation_binding_js_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller: controller, target, instruction, isParameterContext: true, platform: this.platform });
    }
};
TranslationParametersBindingRenderer = __decorate([
    runtime_html_1.renderer(exports.TranslationParametersInstructionType),
    __param(0, runtime_html_1.IExpressionParser),
    __param(1, runtime_html_1.IObserverLocator),
    __param(2, runtime_html_1.IPlatform)
], TranslationParametersBindingRenderer);
exports.TranslationParametersBindingRenderer = TranslationParametersBindingRenderer;
//# sourceMappingURL=translation-parameters-renderer.js.map