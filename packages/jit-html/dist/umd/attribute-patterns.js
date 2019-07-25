(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/jit"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const jit_1 = require("@aurelia/jit");
    /**
     * Attribute syntax pattern recognizer, helping Aurelia understand template:
     * ```html
     * <div attr.some-attr="someAttrValue"></div>
     * <div some-attr.attr="someAttrValue"></div>
     * ````
     */
    let AttrAttributePattern = class AttrAttributePattern {
        ['attr.PART'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[1], 'attr');
        }
        ['PART.attr'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[0], 'attr');
        }
    };
    AttrAttributePattern = tslib_1.__decorate([
        jit_1.attributePattern({ pattern: 'attr.PART', symbols: '.' }, { pattern: 'PART.attr', symbols: '.' })
    ], AttrAttributePattern);
    exports.AttrAttributePattern = AttrAttributePattern;
    /**
     * Style syntax pattern recognizer, helps Aurelia understand template:
     * ```html
     * <div background.style="bg"></div>
     * <div style.background="bg"></div>
     * <div background-color.style="bg"></div>
     * <div style.background-color="bg"></div>
     * <div -webkit-user-select.style="select"></div>
     * <div style.-webkit-user-select="select"></div>
     * <div --custom-prop-css.style="cssProp"></div>
     * <div style.--custom-prop-css="cssProp"></div>
     * ```
     */
    let StyleAttributePattern = class StyleAttributePattern {
        ['style.PART'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[1], 'style');
        }
        ['PART.style'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[0], 'style');
        }
    };
    StyleAttributePattern = tslib_1.__decorate([
        jit_1.attributePattern({ pattern: 'style.PART', symbols: '.' }, { pattern: 'PART.style', symbols: '.' })
    ], StyleAttributePattern);
    exports.StyleAttributePattern = StyleAttributePattern;
    /**
     * Class syntax pattern recognizer, helps Aurelia understand template:
     * ```html
     * <div my-class.class="class"></div>
     * <div class.my-class="class"></div>
     * <div ✔.class="checked"></div>
     * <div class.✔="checked"></div>
     * ```
     */
    let ClassAttributePattern = class ClassAttributePattern {
        ['class.PART'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[1], 'class');
        }
        ['PART.class'](rawName, rawValue, parts) {
            return new jit_1.AttrSyntax(rawName, rawValue, parts[0], 'class');
        }
    };
    ClassAttributePattern = tslib_1.__decorate([
        jit_1.attributePattern({ pattern: 'class.PART', symbols: '.' }, { pattern: 'PART.class', symbols: '.' })
    ], ClassAttributePattern);
    exports.ClassAttributePattern = ClassAttributePattern;
});
//# sourceMappingURL=attribute-patterns.js.map