import { attributePattern, AttrSyntax } from '@aurelia/jit';
/**
 * Attribute syntax pattern recognizer, helping Aurelia understand template:
 * ```html
 * <div attr.some-attr="someAttrValue"></div>
 * <div some-attr.attr="someAttrValue"></div>
 * ````
 */
export class AttrAttributePattern {
    ['attr.PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[1], 'attr');
    }
    ['PART.attr'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'attr');
    }
}
attributePattern({ pattern: 'attr.PART', symbols: '.' }, { pattern: 'PART.attr', symbols: '.' })(AttrAttributePattern);
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
export class StyleAttributePattern {
    ['style.PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[1], 'style');
    }
    ['PART.style'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'style');
    }
}
attributePattern({ pattern: 'style.PART', symbols: '.' }, { pattern: 'PART.style', symbols: '.' })(StyleAttributePattern);
/**
 * Class syntax pattern recognizer, helps Aurelia understand template:
 * ```html
 * <div my-class.class="class"></div>
 * <div class.my-class="class"></div>
 * <div ✔.class="checked"></div>
 * <div class.✔="checked"></div>
 * ```
 */
export class ClassAttributePattern {
    ['class.PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[1], 'class');
    }
    ['PART.class'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'class');
    }
}
attributePattern({ pattern: 'class.PART', symbols: '.' }, { pattern: 'PART.class', symbols: '.' })(ClassAttributePattern);
//# sourceMappingURL=attribute-pattern.js.map