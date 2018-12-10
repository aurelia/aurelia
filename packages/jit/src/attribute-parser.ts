import { all, DI, inject } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { IAttributePattern, IAttributePatternHandler, Interpretation, ISyntaxInterpreter } from './attribute-pattern';

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>()
  .withDefault(x => x.singleton(AttributeParser));

/*@internal*/
@inject(ISyntaxInterpreter, all(IAttributePattern))
export class AttributeParser implements IAttributeParser {
  private interpreter: ISyntaxInterpreter;
  private cache: Record<string, Interpretation>;
  private patterns: Record<string, IAttributePatternHandler>;

  constructor(interpreter: ISyntaxInterpreter, attrPatterns: IAttributePattern[]) {
    this.interpreter = interpreter;
    this.cache = {};
    const patterns: AttributeParser['patterns'] = this.patterns = {};
    attrPatterns.forEach(attrPattern => {
      const defs = attrPattern.$patternDefs;
      interpreter.add(defs);
      defs.forEach(def => {
        patterns[def.pattern] = attrPattern as unknown as IAttributePatternHandler;
      });
    });
  }

  public parse(name: string, value: string): AttrSyntax {
    let interpretation = this.cache[name];
    if (interpretation === undefined) {
      interpretation = this.cache[name] = this.interpreter.interpret(name);
    }
    const pattern = interpretation.pattern;
    if (pattern === null) {
      return new AttrSyntax(name, value, name, null);
    } else {
      return this.patterns[pattern][pattern](name, value, interpretation.parts);
    }
  }
}
