var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { camelCase } from '../../../../kernel/dist/native-modules/index.js';
import { TranslationBinding } from './translation-binding.js';
import { BindingMode, IExpressionParser, renderer, IObserverLocator, attributePattern, AttrSyntax, bindingCommand, IPlatform, IAttrMapper, } from '../../../../runtime-html/dist/native-modules/index.js';
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
    constructor(m) {
        this.m = m;
        this.bindingType = 53 /* BindCommand */;
    }
    static get inject() { return [IAttrMapper]; }
    build(info) {
        var _a;
        let target;
        if (info.bindable == null) {
            target = (_a = this.m.map(info.node, info.attr.target)) !== null && _a !== void 0 ? _a : camelCase(info.attr.target);
        }
        else {
            target = info.bindable.property;
        }
        return new TranslationParametersBindingInstruction(info.expr, target);
    }
};
TranslationParametersBindingCommand = __decorate([
    bindingCommand(attribute)
], TranslationParametersBindingCommand);
export { TranslationParametersBindingCommand };
let TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        TranslationBinding.create({ parser: this.parser, observerLocator: this.observerLocator, context, controller: controller, target, instruction, isParameterContext: true, platform: this.platform });
    }
};
TranslationParametersBindingRenderer = __decorate([
    renderer(TranslationParametersInstructionType),
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TranslationParametersBindingRenderer);
export { TranslationParametersBindingRenderer };
//# sourceMappingURL=translation-parameters-renderer.js.map