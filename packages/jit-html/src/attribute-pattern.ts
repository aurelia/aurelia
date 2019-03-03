import { attributePattern, AttrSyntax, IAttributePattern } from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';

export interface AttrAttributePattern extends IAttributePattern {}
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
