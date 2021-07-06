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
exports.TranslationBindBindingRenderer = exports.TranslationBindBindingCommand = exports.TranslationBindBindingInstruction = exports.TranslationBindAttributePattern = exports.TranslationBindInstructionType = exports.TranslationBindingRenderer = exports.TranslationBindingCommand = exports.TranslationBindingInstruction = exports.TranslationAttributePattern = exports.TranslationInstructionType = void 0;
const kernel_1 = require("@aurelia/kernel");
const translation_binding_js_1 = require("./translation-binding.js");
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
    constructor(m) {
        this.m = m;
        this.bindingType = 284 /* CustomCommand */;
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
        return new TranslationBindingInstruction(info.expr, target);
    }
}
exports.TranslationBindingCommand = TranslationBindingCommand;
let TranslationBindingRenderer = class TranslationBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, renderingController, target, instruction) {
        translation_binding_js_1.TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.observerLocator,
            context: renderingController.container,
            controller: renderingController,
            target,
            instruction,
            platform: this.platform,
        });
    }
};
TranslationBindingRenderer = __decorate([
    runtime_html_1.renderer(exports.TranslationInstructionType),
    __param(0, runtime_html_1.IExpressionParser),
    __param(1, runtime_html_1.IObserverLocator),
    __param(2, runtime_html_1.IPlatform)
], TranslationBindingRenderer);
exports.TranslationBindingRenderer = TranslationBindingRenderer;
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
        return new TranslationBindBindingInstruction(info.expr, target);
    }
}
exports.TranslationBindBindingCommand = TranslationBindBindingCommand;
let TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, renderingController, target, instruction) {
        translation_binding_js_1.TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.observerLocator,
            context: renderingController.container,
            controller: renderingController,
            target,
            instruction,
            platform: this.platform
        });
    }
};
TranslationBindBindingRenderer = __decorate([
    runtime_html_1.renderer(exports.TranslationBindInstructionType),
    __param(0, runtime_html_1.IExpressionParser),
    __param(1, runtime_html_1.IObserverLocator),
    __param(2, runtime_html_1.IPlatform)
], TranslationBindBindingRenderer);
exports.TranslationBindBindingRenderer = TranslationBindBindingRenderer;
//# sourceMappingURL=translation-renderer.js.map