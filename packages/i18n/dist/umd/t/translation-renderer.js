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
    exports.TranslationInstructionType = 'tt';
    class TranslationAttributePattern {
        static registerAlias(alias) {
            this.prototype[alias] = function (rawName, rawValue, parts) {
                return new jit_1.AttrSyntax(rawName, rawValue, '', alias);
            };
        }
    }
    exports.TranslationAttributePattern = TranslationAttributePattern;
    class TranslationBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = exports.TranslationInstructionType;
            this.mode = runtime_1.BindingMode.toView;
        }
    }
    exports.TranslationBindingInstruction = TranslationBindingInstruction;
    class TranslationBindingCommand {
        constructor() {
            this.bindingType = 284 /* CustomCommand */;
        }
        compile(binding) {
            return new TranslationBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindingCommand = TranslationBindingCommand;
    let TranslationBindingRenderer = class TranslationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller, target, instruction });
        }
    };
    TranslationBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer(exports.TranslationInstructionType),
        tslib_1.__param(0, runtime_1.IExpressionParser),
        tslib_1.__param(1, runtime_1.IObserverLocator),
        tslib_1.__metadata("design:paramtypes", [Object, Object])
    ], TranslationBindingRenderer);
    exports.TranslationBindingRenderer = TranslationBindingRenderer;
    exports.TranslationBindInstructionType = 'tbt';
    class TranslationBindAttributePattern {
        static registerAlias(alias) {
            const bindPattern = `${alias}.bind`;
            this.prototype[bindPattern] = function (rawName, rawValue, parts) {
                return new jit_1.AttrSyntax(rawName, rawValue, parts[1], bindPattern);
            };
        }
    }
    exports.TranslationBindAttributePattern = TranslationBindAttributePattern;
    class TranslationBindBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = exports.TranslationBindInstructionType;
            this.mode = runtime_1.BindingMode.toView;
        }
    }
    exports.TranslationBindBindingInstruction = TranslationBindBindingInstruction;
    class TranslationBindBindingCommand {
        constructor() {
            this.bindingType = 53 /* BindCommand */;
        }
        compile(binding) {
            return new TranslationBindBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindBindingCommand = TranslationBindBindingCommand;
    let TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller, target, instruction });
        }
    };
    TranslationBindBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer(exports.TranslationBindInstructionType),
        tslib_1.__param(0, runtime_1.IExpressionParser),
        tslib_1.__param(1, runtime_1.IObserverLocator),
        tslib_1.__metadata("design:paramtypes", [Object, Object])
    ], TranslationBindBindingRenderer);
    exports.TranslationBindBindingRenderer = TranslationBindBindingRenderer;
});
//# sourceMappingURL=translation-renderer.js.map