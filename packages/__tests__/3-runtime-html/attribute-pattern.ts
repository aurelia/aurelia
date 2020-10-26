import { attributePattern, AttrSyntax } from '@aurelia/runtime-html';

/**
 * Attribute syntax pattern recognizer, helping Aurelia understand template:
 * ```html
 * <div attr.some-attr="someAttrValue"></div>
 * <div some-attr.attr="someAttrValue"></div>
 * ````
 */
@attributePattern(
  { pattern: 'attr.PART', symbols: '.' },
  { pattern: 'PART.attr', symbols: '.' }
)
export class AttrAttributePattern {
  public ['attr.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'attr');
  }

  public ['PART.attr'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'attr');
  }
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
@attributePattern(
  { pattern: 'style.PART', symbols: '.' },
  { pattern: 'PART.style', symbols: '.' }
)
export class StyleAttributePattern {
  public ['style.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'style');
  }

  public ['PART.style'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'style');
  }
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
@attributePattern(
  { pattern: 'class.PART', symbols: '.' },
  { pattern: 'PART.class', symbols: '.' }
)
export class ClassAttributePattern {
  public ['class.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[1], 'class');
  }

  public ['PART.class'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'class');
  }
}
