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
    exports.TranslationBindBindingRenderer = exports.TranslationBindBindingCommand = exports.TranslationBindBindingInstruction = exports.TranslationBindAttributePattern = exports.TranslationBindInstructionType = exports.TranslationBindingRenderer = exports.TranslationBindingCommand = exports.TranslationBindingInstruction = exports.TranslationAttributePattern = exports.TranslationInstructionType = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const translation_binding_1 = require("./translation-binding");
    exports.TranslationInstructionType = 'tt';
    class TranslationAttributePattern {
        static registerAlias(alias) {
            this.prototype[alias] = function (rawName, rawValue, parts) {
                return new runtime_1.AttrSyntax(rawName, rawValue, '', alias);
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
            return new TranslationBindingInstruction(binding.expression, runtime_1.getTarget(binding, false));
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
    TranslationBindingRenderer = __decorate([
        runtime_1.instructionRenderer(exports.TranslationInstructionType),
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], TranslationBindingRenderer);
    exports.TranslationBindingRenderer = TranslationBindingRenderer;
    exports.TranslationBindInstructionType = 'tbt';
    class TranslationBindAttributePattern {
        static registerAlias(alias) {
            const bindPattern = `${alias}.bind`;
            this.prototype[bindPattern] = function (rawName, rawValue, parts) {
                return new runtime_1.AttrSyntax(rawName, rawValue, parts[1], bindPattern);
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
            return new TranslationBindBindingInstruction(binding.expression, runtime_1.getTarget(binding, false));
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
    TranslationBindBindingRenderer = __decorate([
        runtime_1.instructionRenderer(exports.TranslationBindInstructionType),
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], TranslationBindBindingRenderer);
    exports.TranslationBindBindingRenderer = TranslationBindBindingRenderer;
});
//# sourceMappingURL=translation-renderer.js.map