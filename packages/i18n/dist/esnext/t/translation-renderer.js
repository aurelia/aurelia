import { __decorate, __param } from "tslib";
import { AttrSyntax, getTarget, } from '@aurelia/jit';
import { BindingMode, IExpressionParser, instructionRenderer, IObserverLocator } from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';
export const TranslationInstructionType = 'tt';
export class TranslationAttributePattern {
    static registerAlias(alias) {
        this.prototype[alias] = function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, '', alias);
        };
    }
}
export class TranslationBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationInstructionType;
        this.mode = BindingMode.toView;
    }
}
export class TranslationBindingCommand {
    constructor() {
        this.bindingType = 284 /* CustomCommand */;
    }
    compile(binding) {
        return new TranslationBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
let TranslationBindingRenderer = class TranslationBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
    }
};
TranslationBindingRenderer = __decorate([
    instructionRenderer(TranslationInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], TranslationBindingRenderer);
export { TranslationBindingRenderer };
export const TranslationBindInstructionType = 'tbt';
export class TranslationBindAttributePattern {
    static registerAlias(alias) {
        const bindPattern = `${alias}.bind`;
        this.prototype[bindPattern] = function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], bindPattern);
        };
    }
}
export class TranslationBindBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationBindInstructionType;
        this.mode = BindingMode.toView;
    }
}
export class TranslationBindBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        return new TranslationBindBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
let TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction });
    }
};
TranslationBindBindingRenderer = __decorate([
    instructionRenderer(TranslationBindInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], TranslationBindBindingRenderer);
export { TranslationBindBindingRenderer };
//# sourceMappingURL=translation-renderer.js.map