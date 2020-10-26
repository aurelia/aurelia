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
        define(["require", "exports", "./translation-binding", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TranslationBindBindingComposer = exports.TranslationBindBindingCommand = exports.TranslationBindBindingInstruction = exports.TranslationBindAttributePattern = exports.TranslationBindInstructionType = exports.TranslationBindingComposer = exports.TranslationBindingCommand = exports.TranslationBindingInstruction = exports.TranslationAttributePattern = exports.TranslationInstructionType = void 0;
    const translation_binding_1 = require("./translation-binding");
    const runtime_html_1 = require("@aurelia/runtime-html");
    exports.TranslationInstructionType = 'tt';
    class TranslationAttributePattern {
        static registerAlias(alias) {
            this.prototype[alias] = function (rawName, rawValue, parts) {
                return new runtime_html_1.AttrSyntax(rawName, rawValue, '', alias);
            };
        }
    }
    exports.TranslationAttributePattern = TranslationAttributePattern;
    class TranslationBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = exports.TranslationInstructionType;
            this.mode = runtime_html_1.BindingMode.toView;
        }
    }
    exports.TranslationBindingInstruction = TranslationBindingInstruction;
    class TranslationBindingCommand {
        constructor() {
            this.bindingType = 284 /* CustomCommand */;
        }
        compile(binding) {
            return new TranslationBindingInstruction(binding.expression, runtime_html_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindingCommand = TranslationBindingCommand;
    let TranslationBindingComposer = class TranslationBindingComposer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        compose(flags, context, controller, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller, target, instruction });
        }
    };
    TranslationBindingComposer = __decorate([
        runtime_html_1.instructionComposer(exports.TranslationInstructionType),
        __param(0, runtime_html_1.IExpressionParser),
        __param(1, runtime_html_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], TranslationBindingComposer);
    exports.TranslationBindingComposer = TranslationBindingComposer;
    exports.TranslationBindInstructionType = 'tbt';
    class TranslationBindAttributePattern {
        static registerAlias(alias) {
            const bindPattern = `${alias}.bind`;
            this.prototype[bindPattern] = function (rawName, rawValue, parts) {
                return new runtime_html_1.AttrSyntax(rawName, rawValue, parts[1], bindPattern);
            };
        }
    }
    exports.TranslationBindAttributePattern = TranslationBindAttributePattern;
    class TranslationBindBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = exports.TranslationBindInstructionType;
            this.mode = runtime_html_1.BindingMode.toView;
        }
    }
    exports.TranslationBindBindingInstruction = TranslationBindBindingInstruction;
    class TranslationBindBindingCommand {
        constructor() {
            this.bindingType = 53 /* BindCommand */;
        }
        compile(binding) {
            return new TranslationBindBindingInstruction(binding.expression, runtime_html_1.getTarget(binding, false));
        }
    }
    exports.TranslationBindBindingCommand = TranslationBindBindingCommand;
    let TranslationBindBindingComposer = class TranslationBindBindingComposer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        compose(flags, context, controller, target, instruction) {
            translation_binding_1.TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller, target, instruction });
        }
    };
    TranslationBindBindingComposer = __decorate([
        runtime_html_1.instructionComposer(exports.TranslationBindInstructionType),
        __param(0, runtime_html_1.IExpressionParser),
        __param(1, runtime_html_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], TranslationBindBindingComposer);
    exports.TranslationBindBindingComposer = TranslationBindBindingComposer;
});
//# sourceMappingURL=translation-composer.js.map