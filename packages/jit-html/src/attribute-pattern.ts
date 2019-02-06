import { attributePattern, AttrSyntax, IAttributePattern } from '@aurelia/jit';
import { IRegistry } from '@aurelia/kernel';

export interface StyleAttributePattern extends IAttributePattern {}
export class StyleAttributePattern implements StyleAttributePattern {
  public static register: IRegistry['register'];

  public ['style.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    // CssRule binding requires input target as camelCase for assignment
    // but here we are not camelcasing it, just keep it as is to preserve template nature
    // do it in BindingCommand.compile phase
    // though scenario like -webkit-user-select needs to be handled as camel case cannot see it
    let cssRule = parts[0];
    if (cssRule[0] === '-') {
      cssRule = cssRule.slice(1);
    }
    return new AttrSyntax(rawName, rawValue, parts[1], 'style');
  }

  public ['PART.style'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    // CssRule binding requires input target as camelCase for assignment
    // but here we are not camelcasing it, just keep it as is to preserve template nature
    // do it in BindingCommand.compile phase
    // though scenario like -webkit-user-select needs to be handled as camel case cannot see it
    let cssRule = parts[0];
    if (cssRule[0] === '-') {
      cssRule = cssRule.slice(1);
    }
    return new AttrSyntax(rawName, rawValue, parts[0], 'style');
  }
}

attributePattern(
  { pattern: 'style.PART', symbols: '.' },
  { pattern: 'PART.style', symbols: '.' }
)(StyleAttributePattern);
