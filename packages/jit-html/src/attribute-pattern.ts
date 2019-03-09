import { attributePattern, AttrSyntax, IAttributePattern } from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';

export interface AttrAttributePattern extends IAttributePattern {}
/**
 * Attribute syntax pattern recognizer, helping Aurelia understand template:
 * ```html
 * <div attr.some-attr="someAttrValue"></div>
 * <div some-attr.attr="someAttrValue"></div>
 * ````
 */
export class AttrAttributePattern implements AttrAttributePattern {
  public static register: IRegistry['register'];

  public ['attr.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'attr');
  }

  public ['PART.attr'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'attr');
  }
}

attributePattern(
  { pattern: 'attr.PART', symbols: '.' },
  { pattern: 'PART.attr', symbols: '.' }
)(AttrAttributePattern);

export interface StyleAttributePattern extends IAttributePattern {}
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
export class StyleAttributePattern implements StyleAttributePattern {
  public static register: IRegistry['register'];

  public ['style.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'style');
  }

  public ['PART.style'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'style');
  }
}

attributePattern(
  { pattern: 'style.PART', symbols: '.' },
  { pattern: 'PART.style', symbols: '.' }
)(StyleAttributePattern);

export interface ClassAttributePattern extends IAttributePattern {}
/**
 * Class syntax pattern recognizer, helps Aurelia understand template:
 * ```html
 * <div my-class.class="class"></div>
 * <div class.my-class="class"></div>
 * <div ✔.class="checked"></div>
 * <div class.✔="checked"></div>
 * ```
 */
export class ClassAttributePattern implements ClassAttributePattern {
  public static register: IRegistry['register'];

  public ['class.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'class');
  }

  public ['PART.class'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'class');
  }
}

attributePattern(
  { pattern: 'class.PART', symbols: '.' },
  { pattern: 'PART.class', symbols: '.' }
)(ClassAttributePattern);
