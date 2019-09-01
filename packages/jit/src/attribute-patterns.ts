import { AttrSyntax } from './ast';
import { attributePattern } from './attribute-pattern';

@attributePattern(
  { pattern: 'PART.PART', symbols: '.' },
  { pattern: 'PART.PART.PART', symbols: '.' }
)
export class DotSeparatedAttributePattern {
  public ['PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }

  public ['PART.PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
  }
}

@attributePattern(
  { pattern: 'ref', symbols: '' },
  { pattern: 'PART.ref', symbols: '.' }
)
export class RefAttributePattern {
  public ['ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'element', 'ref');
  }

  public ['PART.ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'ref');
  }
}

@attributePattern({ pattern: ':PART', symbols: ':' })
export class ColonPrefixedBindAttributePattern {
  public [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

@attributePattern({ pattern: '@PART', symbols: '@' })
export class AtPrefixedTriggerAttributePattern {
  public ['@PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}
