import { AttrSyntax } from '@aurelia/jit';
/**
 * Attribute syntax pattern recognizer, helping Aurelia understand template:
 * ```html
 * <div attr.some-attr="someAttrValue"></div>
 * <div some-attr.attr="someAttrValue"></div>
 * ````
 */
export declare class AttrAttributePattern {
    ['attr.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.attr'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
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
export declare class StyleAttributePattern {
    ['style.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.style'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
/**
 * Class syntax pattern recognizer, helps Aurelia understand template:
 * ```html
 * <div my-class.class="class"></div>
 * <div class.my-class="class"></div>
 * <div ✔.class="checked"></div>
 * <div class.✔="checked"></div>
 * ```
 */
export declare class ClassAttributePattern {
    ['class.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.class'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
//# sourceMappingURL=attribute-patterns.d.ts.map