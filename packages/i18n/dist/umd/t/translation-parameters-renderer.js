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
        define(["require", "exports", "@aurelia/runtime", "./translation-binding"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TranslationParametersBindingRenderer = exports.TranslationParametersBindingCommand = exports.TranslationParametersBindingInstruction = exports.TranslationParametersAttributePattern = exports.TranslationParametersInstructionType = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const translation_binding_1 = require("./translation-binding");
    exports.TranslationParametersInstructionType = 'tpt';
    // `.bind` part is needed here only for vCurrent compliance
    const attribute = 't-params.bind';
    let TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
        [attribute](rawName, rawValue, parts) {
            return new runtime_1.AttrSyntax(rawName, rawValue, '', attribute);
        }
    };
    TranslationParametersAttributePattern = __decorate([
        runtime_1.attributePattern({ pattern: attribute, symbols: '' })
    ], TranslationParametersAttributePattern);
    exports.TranslationParametersAttributePattern = TranslationParametersAttributePattern;
    class TranslationParametersBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = exports.TranslationParametersInstructionType;
            this.mode = runtime_1.BindingMode.toView;
        }
    }
    exports.TranslationParametersBindingInstruction = TranslationParametersBindingInstruction;
    let TranslationParametersBindingCommand = class TranslationParametersBindingCommand {
        constructor() {
            this.bindingType = 53 /* BindCommand */;
        }
        compile(binding) {
            return new TranslationParametersBindingInstruction(binding.expression, runtime_1.getTarget(binding, false));
        }
    };
    TranslationParametersBindingCommand = __decorate([
        runtime_1.bindingCommand(attribute)
    ], TranslationParametersBindingCommand);
    exports.TranslationParametersBindingCommand = TranslationParametersBindingCommand;
    let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller: controller, target, instruction, isParameterContext: true });
        }
    };
    TranslationParametersBindingRenderer = __decorate([
        runtime_1.instructionRenderer(exports.TranslationParametersInstructionType),
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], TranslationParametersBindingRenderer);
    exports.TranslationParametersBindingRenderer = TranslationParametersBindingRenderer;
});
//# sourceMappingURL=translation-parameters-renderer.js.map