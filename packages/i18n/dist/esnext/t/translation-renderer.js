import { __decorate, __param } from "tslib";
import { AttrSyntax, BindingCommand, getTarget, IAttributePattern } from '@aurelia/jit';
import { Registration } from '@aurelia/kernel';
import { BindingMode, IExpressionParser, instructionRenderer, IObserverLocator } from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';
export const TranslationInstructionType = 'tt';
export class TranslationAttributePattern {
    static register(container) {
        const patterns = this.aliases;
        const patternDefs = [];
        for (const pattern of patterns) {
            this.prototype[pattern] = this.createPattern(pattern);
            patternDefs.push({ pattern, symbols: '' });
        }
        this.prototype.$patternDefs = patternDefs;
        Registration.singleton(IAttributePattern, this).register(container);
    }
    static createPattern(pattern) {
        return function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, '', pattern);
        };
    }
}
/**
 * Enables aliases for translation/localization attribute.
 */
TranslationAttributePattern.aliases = ['t'];
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
    static register(container) {
        for (const alias of this.aliases) {
            // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
            // In this case, it probably has lesser or no significance as actual binding mode.
            const key = BindingCommand.keyFrom(alias);
            Registration.singleton(key, this).register(container);
            Registration.alias(key, this).register(container);
        }
    }
    compile(binding) {
        return new TranslationBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
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
        Registration.singleton(IAttributePattern, this).register(container);
    }
    static createPattern(pattern) {
        return function (rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], pattern);
        };
    }
}
/**
 * Enables aliases for translation/localization attribute.
 */
TranslationBindAttributePattern.aliases = ['t'];
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
    static register(container) {
        for (const alias of this.aliases) {
            // `.bind` is directly used here as pattern to replicate the vCurrent syntax.
            // In this case, it probably has lesser or no significance as actual binding mode.
            const key = BindingCommand.keyFrom(`${alias}.bind`);
            Registration.singleton(key, this).register(container);
            Registration.alias(key, this).register(container);
        }
    }
    compile(binding) {
        return new TranslationBindBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
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