(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./ast", "./attribute-pattern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const ast_1 = require("./ast");
    const attribute_pattern_1 = require("./attribute-pattern");
    let DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
        ['PART.PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], parts[1]);
        }
        ['PART.PART.PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], parts[2]);
        }
    };
    DotSeparatedAttributePattern = tslib_1.__decorate([
        attribute_pattern_1.attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })
    ], DotSeparatedAttributePattern);
    exports.DotSeparatedAttributePattern = DotSeparatedAttributePattern;
    let RefAttributePattern = class RefAttributePattern {
        ['ref'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, 'element', 'ref');
        }
        ['PART.ref'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], 'ref');
        }
    };
    RefAttributePattern = tslib_1.__decorate([
        attribute_pattern_1.attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' })
    ], RefAttributePattern);
    exports.RefAttributePattern = RefAttributePattern;
    let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
        [':PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], 'bind');
        }
    };
    ColonPrefixedBindAttributePattern = tslib_1.__decorate([
        attribute_pattern_1.attributePattern({ pattern: ':PART', symbols: ':' })
    ], ColonPrefixedBindAttributePattern);
    exports.ColonPrefixedBindAttributePattern = ColonPrefixedBindAttributePattern;
    let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
        ['@PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], 'trigger');
        }
    };
    AtPrefixedTriggerAttributePattern = tslib_1.__decorate([
        attribute_pattern_1.attributePattern({ pattern: '@PART', symbols: '@' })
    ], AtPrefixedTriggerAttributePattern);
    exports.AtPrefixedTriggerAttributePattern = AtPrefixedTriggerAttributePattern;
});
//# sourceMappingURL=attribute-patterns.js.map