import { all, DI, Key, Profiler } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { IAttributePattern, IAttributePatternHandler, Interpretation, ISyntaxInterpreter } from './attribute-pattern';

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>('IAttributeParser').withDefault(x => x.singleton(AttributeParser));

const { enter, leave } = Profiler.createTimer('AttributeParser');

/** @internal */
export class AttributeParser implements IAttributeParser {
  public static readonly inject: readonly Key[] = [ISyntaxInterpreter, all(IAttributePattern)];

  private readonly interpreter: ISyntaxInterpreter;
  private readonly cache: Record<string, Interpretation>;
  private readonly patterns: Record<string, IAttributePatternHandler>;

  public constructor(interpreter: ISyntaxInterpreter, attrPatterns: IAttributePattern[]) {
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
