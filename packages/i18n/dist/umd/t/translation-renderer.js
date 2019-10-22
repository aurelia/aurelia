(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/jit", "@aurelia/kernel", "@aurelia/runtime", "./translation-binding"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const jit_1 = require("@aurelia/jit");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const translation_binding_1 = require("./translation-binding");
    exports.TranslationInstructionType = 'tt';
    class TranslationAttributePattern {
        static register(container) {
            const patterns = this.aliases;
            const patternDefs = [];
            for (const pattern of patterns) {
                this.prototype[pattern] = this.createPattern(pattern);
                patternDefs.push({ pattern, symbols: '' });
            }
            this.prototype.$patternDefs = patternDefs;
            kernel_1.Registration.singleton(jit_1.IAttributePattern, this).register(container);
        }
        static createPattern(pattern) {
            return function (rawName, rawValue, parts) {
                return new jit_1.AttrSyntax(rawName, rawValue, '', pattern);
            };
        }
    }
    exports.TranslationAttributePattern = TranslationAttributePattern;
    /**
     * Enables aliases for translation/localization attribute.
     */
    TranslationAttributePattern.aliases = ['t'];
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
        static register(container) {
            for (const alias of this.aliases) {
                // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
                // In this case, it probably has lesser or no significance as actual binding mode.
                const key = jit_1.BindingCommand.keyFrom(alias);
                kernel_1.Registration.singleton(key, this).register(container);
                kernel_1.Registration.alias(key, this).register(container);
            }
        }
        compile(binding) {
            return new TranslationBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindingCommand = TranslationBindingCommand;
    /**
     * Enables aliases for translation/localization attribute.
     */
    TranslationBindingCommand.aliases = ['t'];
    let TranslationBindingRenderer = class TranslationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
        }
    };
    TranslationBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer(exports.TranslationInstructionType),
        tslib_1.__param(0, runtime_1.IExpressionParser),
        tslib_1.__param(1, runtime_1.IObserverLocator)
    ], TranslationBindingRenderer);
    exports.TranslationBindingRenderer = TranslationBindingRenderer;
    exports.TranslationBindInstructionType = 'tbt';
    class TranslationBindAttributePattern {
        static register(container) {
            const patterns = this.aliases;
            const patternDefs = [];
            for (const pattern of patterns) {
                // `.bind` is directly used her as pattern to replicate the vCurrent syntax.
                // In this case, it probably has lesser or no significance as actual binding mode.
                const bindPattern = `${pattern}.bind`;
                this.prototype[bindPattern] = this.createPattern(bindPattern);
                patternDefs.push({ pattern: bindPattern, symbols: '.' });
            }
            this.prototype.$patternDefs = patternDefs;
            kernel_1.Registration.singleton(jit_1.IAttributePattern, this).register(container);
        }
        static createPattern(pattern) {
            return function (rawName, rawValue, parts) {
                return new jit_1.AttrSyntax(rawName, rawValue, parts[1], pattern);
            };
        }
    }
    exports.TranslationBindAttributePattern = TranslationBindAttributePattern;
    /**
     * Enables aliases for translation/localization attribute.
     */
    TranslationBindAttributePattern.aliases = ['t'];
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
        static register(container) {
            for (const alias of this.aliases) {
                // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
                // In this case, it probably has lesser or no significance as actual binding mode.
                const key = jit_1.BindingCommand.keyFrom(`${alias}.bind`);
                kernel_1.Registration.singleton(key, this).register(container);
                kernel_1.Registration.alias(key, this).register(container);
            }
        }
        compile(binding) {
            return new TranslationBindBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindBindingCommand = TranslationBindBindingCommand;
    /**
     * Enables aliases for translation/localization attribute.
     */
    TranslationBindBindingCommand.aliases = ['t'];
    let TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
        }
    };
    TranslationBindBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer(exports.TranslationBindInstructionType),
        tslib_1.__param(0, runtime_1.IExpressionParser),
        tslib_1.__param(1, runtime_1.IObserverLocator)
    ], TranslationBindBindingRenderer);
    exports.TranslationBindBindingRenderer = TranslationBindBindingRenderer;
});
//# sourceMappingURL=translation-renderer.js.map