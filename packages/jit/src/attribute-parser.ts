import { all, DI, inject } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { IAttributePattern, ISyntaxInterpreter } from './attribute-pattern';
import { Char } from './common';

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>()
  .withDefault(x => x.singleton(AttributeParser));

/*@internal*/
@inject(ISyntaxInterpreter, all(IAttributePattern))
export class AttributeParser implements IAttributeParser {
  private interpreter: ISyntaxInterpreter;
  private cache: Record<string, [string, string]>;
  private patterns: Record<string, IAttributePattern>;

  constructor(interpreter: ISyntaxInterpreter, attrPatterns: IAttributePattern[]) {
    this.interpreter = interpreter;
    this.cache = {};
    const patterns = this.patterns = {};
    attrPatterns.forEach(attrPattern => {
      const patternOrPatterns = attrPattern.$patternOrPatterns;
      if (Array.isArray(patternOrPatterns)) {
        patternOrPatterns.forEach(pattern => {
          patterns[pattern] = attrPattern;
        });
      } else {
        patterns[patternOrPatterns] = attrPattern;
      }
    });
  }

  public parse(name: string, value: string): AttrSyntax {
    let target: string;
    let command: string;
    const existing = this.cache[name];
    if (existing === undefined) {
      const interpretation = this.interpreter.interpret(name);
      let lastIndex = 0;
      target = name;
      for (let i = 0, ii = name.length; i < ii; ++i) {
        if (name.charCodeAt(i) === Char.Dot) {
          // set the targetName to only the part that comes before the first dot
          if (name === target) {
            target = name.slice(0, i);
          }
          lastIndex = i;
        }
      }
      command = lastIndex > 0 ? name.slice(lastIndex + 1) : null;
      this.cache[name] = [target, command];
    } else {
      target = existing[0];
      command = existing[1];
    }

    return new AttrSyntax(name, value, target, command && command.length ? command : null);
  }
}
