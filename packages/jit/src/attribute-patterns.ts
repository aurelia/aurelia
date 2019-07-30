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
  { pattern: 'ref.PART', symbols: '.' }
)
export class RefAttributePattern {
  public ['ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'ref', null);
  }

  public ['ref.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'ref', parts[1]);
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
