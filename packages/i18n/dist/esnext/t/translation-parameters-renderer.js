import { __decorate, __param } from "tslib";
import { attributePattern, AttrSyntax, bindingCommand, getTarget } from '@aurelia/jit';
import { BindingMode, IExpressionParser, instructionRenderer, IObserverLocator } from '@aurelia/runtime';
import { TranslationBinding } from './translation-binding';
export const TranslationParametersInstructionType = 'tpt';
// `.bind` part is needed here only for vCurrent compliance
const attribute = 't-params.bind';
let TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
    [attribute](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, '', attribute);
    }
};
TranslationParametersAttributePattern = __decorate([
    attributePattern({ pattern: attribute, symbols: '' })
], TranslationParametersAttributePattern);
export { TranslationParametersAttributePattern };
export class TranslationParametersBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = TranslationParametersInstructionType;
        this.mode = BindingMode.toView;
    }
}
let TranslationParametersBindingCommand = class TranslationParametersBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        return new TranslationParametersBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
TranslationParametersBindingCommand = __decorate([
    bindingCommand(attribute)
], TranslationParametersBindingCommand);
export { TranslationParametersBindingCommand };
let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, renderable, target, instruction, isParameterContext: true });
    }
};
TranslationParametersBindingRenderer = __decorate([
    instructionRenderer(TranslationParametersInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], TranslationParametersBindingRenderer);
export { TranslationParametersBindingRenderer };
//# sourceMappingURL=translation-parameters-renderer.js.map