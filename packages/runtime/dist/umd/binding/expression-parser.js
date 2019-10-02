(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const ast_1 = require("./ast");
    exports.IExpressionParser = kernel_1.DI.createInterface('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));
    /** @internal */
    class ExpressionParser {
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
                        return ast_1.PrimitiveLiteralExpression.$empty;
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
                    current = new ast_1.CallScopeExpression(firstPart.replace('()', ''), kernel_1.PLATFORM.emptyArray);
                }
                else {
                    current = new ast_1.AccessScopeExpression(parts[0]);
                }
                let index = 1;
                while (index < parts.length) {
                    const currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new ast_1.CallMemberExpression(current, currentPart.replace('()', ''), kernel_1.PLATFORM.emptyArray);
                    }
                    else {
                        current = new ast_1.AccessMemberExpression(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw kernel_1.Reporter.error(3, e);
            }
        }
    }
    exports.ExpressionParser = ExpressionParser;
    /* eslint-disable @typescript-eslint/indent */
    var BindingType;
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
    })(BindingType = exports.BindingType || (exports.BindingType = {}));
});
/* eslint-enable @typescript-eslint/indent */
//# sourceMappingURL=expression-parser.js.map