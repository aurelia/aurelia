import { all, Constructable, DI } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { AttributePattern, IAttributePattern, Interpretation, ISyntaxInterpreter } from './attribute-pattern';

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>('IAttributeParser').withDefault(x => x.singleton(AttributeParser));

/** @internal */
export class AttributeParser implements IAttributeParser {
  private readonly cache: Record<string, Interpretation> = {};
  private readonly patterns: Record<string, IAttributePattern>;

  public constructor(
    @ISyntaxInterpreter private readonly interpreter: ISyntaxInterpreter,
    @all(IAttributePattern) attrPatterns: IAttributePattern[],
  ) {
    this.interpreter = interpreter;
    const patterns: AttributeParser['patterns'] = this.patterns = {};
    attrPatterns.forEach(attrPattern => {
      const defs = AttributePattern.getPatternDefinitions(attrPattern.constructor as Constructable);
      interpreter.add(defs);
      defs.forEach(def => {
        patterns[def.pattern] = attrPattern as unknown as IAttributePattern;
      });
    });
  }

  public parse(name: string, value: string): AttrSyntax {
    let interpretation = this.cache[name];
    if (interpretation == null) {
      interpretation = this.cache[name] = this.interpreter.interpret(name);
    }
    const pattern = interpretation.pattern;
    if (pattern == null) {
      return new AttrSyntax(name, value, name, null);
    } else {
      return this.patterns[pattern][pattern](name, value, interpretation.parts);
    }
  }
}
