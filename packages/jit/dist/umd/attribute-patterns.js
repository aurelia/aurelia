var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ast", "./attribute-pattern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    DotSeparatedAttributePattern = __decorate([
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
    RefAttributePattern = __decorate([
        attribute_pattern_1.attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' })
    ], RefAttributePattern);
    exports.RefAttributePattern = RefAttributePattern;
    let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
        [':PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], 'bind');
        }
    };
    ColonPrefixedBindAttributePattern = __decorate([
        attribute_pattern_1.attributePattern({ pattern: ':PART', symbols: ':' })
    ], ColonPrefixedBindAttributePattern);
    exports.ColonPrefixedBindAttributePattern = ColonPrefixedBindAttributePattern;
    let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
        ['@PART'](rawName, rawValue, parts) {
            return new ast_1.AttrSyntax(rawName, rawValue, parts[0], 'trigger');
        }
    };
    AtPrefixedTriggerAttributePattern = __decorate([
        attribute_pattern_1.attributePattern({ pattern: '@PART', symbols: '@' })
    ], AtPrefixedTriggerAttributePattern);
    exports.AtPrefixedTriggerAttributePattern = AtPrefixedTriggerAttributePattern;
});
//# sourceMappingURL=attribute-patterns.js.map