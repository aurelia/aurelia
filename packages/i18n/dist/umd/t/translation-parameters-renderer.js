(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/jit", "@aurelia/runtime", "./translation-binding"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const jit_1 = require("@aurelia/jit");
    const runtime_1 = require("@aurelia/runtime");
    const translation_binding_1 = require("./translation-binding");
    exports.TranslationParametersInstructionType = 'tpt';
    // `.bind` part is needed here only for vCurrent compliance
    const attribute = 't-params.bind';
    let TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
        [attribute](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, '', attribute);
        }
    };
    TranslationParametersAttributePattern = tslib_1.__decorate([
        jit_1.attributePattern({ pattern: attribute, symbols: '' })
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
            return new TranslationParametersBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    };
    TranslationParametersBindingCommand = tslib_1.__decorate([
        jit_1.bindingCommand(attribute)
    ], TranslationParametersBindingCommand);
    exports.TranslationParametersBindingCommand = TranslationParametersBindingCommand;
    let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction, isParameterContext: true });
        }
    };
    TranslationParametersBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer(exports.TranslationParametersInstructionType),
        tslib_1.__param(0, runtime_1.IExpressionParser),
        tslib_1.__param(1, runtime_1.IObserverLocator)
    ], TranslationParametersBindingRenderer);
    exports.TranslationParametersBindingRenderer = TranslationParametersBindingRenderer;
});
//# sourceMappingURL=translation-parameters-renderer.js.map