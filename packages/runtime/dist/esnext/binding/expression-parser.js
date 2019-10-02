import { DI, PLATFORM, Reporter, } from '@aurelia/kernel';
import { AccessMemberExpression, AccessScopeExpression, CallMemberExpression, CallScopeExpression, PrimitiveLiteralExpression, } from './ast';
export const IExpressionParser = DI.createInterface('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));
/** @internal */
export class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
    }
    parse(expression, bindingType) {
        switch (bindingType) {
            case 2048 /* Interpolation */: {
                let found = this.interpolationLookup[expression];
                if (found === void 0) {
                    found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                }
                return found;
            }
            case 539 /* ForCommand */: {
                let found = this.forOfLookup[expression];
                if (found === void 0) {
                    found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                }
                return found;
            }
            default: {
                // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                // But don't cache it, because empty strings are always invalid for any other type of binding
                if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                    return PrimitiveLiteralExpression.$empty;
                }
                let found = this.expressionLookup[expression];
                if (found === void 0) {
                    found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                }
                return found;
            }
        }
    }
    cache(expressions) {
        const { forOfLookup, expressionLookup, interpolationLookup } = this;
        for (const expression in expressions) {
            const expr = expressions[expression];
            switch (expr.$kind) {
                case 24 /* Interpolation */:
                    interpolationLookup[expression] = expr;
                    break;
                case 6199 /* ForOfStatement */:
                    forOfLookup[expression] = expr;
                    break;
                default:
                    expressionLookup[expression] = expr;
            }
        }
    }
    parseCore(expression, bindingType) {
        try {
            const parts = expression.split('.');
            const firstPart = parts[0];
            let current;
            if (firstPart.endsWith('()')) {
                current = new CallScopeExpression(firstPart.replace('()', ''), PLATFORM.emptyArray);
            }
            else {
                current = new AccessScopeExpression(parts[0]);
            }
            let index = 1;
            while (index < parts.length) {
                const currentPart = parts[index];
                if (currentPart.endsWith('()')) {
                    current = new CallMemberExpression(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
                }
                else {
                    current = new AccessMemberExpression(current, parts[index]);
                }
                index++;
            }
            return current;
        }
        catch (e) {
            throw Reporter.error(3, e);
        }
    }
}
/* eslint-disable @typescript-eslint/indent */
export var BindingType;
(function (BindingType) {
    BindingType[BindingType["None"] = 0] = "None";
    BindingType[BindingType["IgnoreCustomAttr"] = 4096] = "IgnoreCustomAttr";
    BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
    BindingType[BindingType["IsRef"] = 5376] = "IsRef";
    BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
    BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
    BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
    BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
    BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
    BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
    BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
    BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
    BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
    BindingType[BindingType["Command"] = 15] = "Command";
    BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
    BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
    BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
    BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
    BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
    BindingType[BindingType["TriggerCommand"] = 4182] = "TriggerCommand";
    BindingType[BindingType["CaptureCommand"] = 4183] = "CaptureCommand";
    BindingType[BindingType["DelegateCommand"] = 4184] = "DelegateCommand";
    BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
    BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
    BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
    BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
})(BindingType || (BindingType = {}));
/* eslint-enable @typescript-eslint/indent */
//# sourceMappingURL=expression-parser.js.map