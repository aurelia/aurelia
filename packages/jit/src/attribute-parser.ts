import { all, Constructable, DI, IContainer, Registration } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { AttributePattern, IAttributePattern, Interpretation, ISyntaxInterpreter, SyntaxInterpreter } from './attribute-pattern';

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;

  cloneTo(container: IContainer): IAttributeParser;
}

export const IAttributeParser = DI
  .createInterface<IAttributeParser>('IAttributeParser')
  .withDefault(x => x.singleton(AttributeParser));

/** @internal */
export class AttributeParser implements IAttributeParser {
  private readonly cache: Record<string, Interpretation> = {};
  private readonly patterns: Record<string, IAttributePattern>;

  public constructor(
    @ISyntaxInterpreter private readonly interpreter: ISyntaxInterpreter,
    // needs to get all attr patterns in the hierarchy,
    // otherwise locally registered pattern will override globally defined patterns
    @all(IAttributePattern, true) attrPatterns: IAttributePattern[],
  ) {
    this.interpreter = interpreter;
    const patterns: AttributeParser['patterns'] = this.patterns = {};
    attrPatterns.forEach(attrPattern => {
      const defs = AttributePattern.getPatternDefinitions(attrPattern.constructor as Constructable);
      defs.forEach(def => {
        // won't allow override
        if (patterns[def.pattern] === void 0) {
          patterns[def.pattern] = attrPattern as unknown as IAttributePattern;
          interpreter.add(def);
        }
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

  public cloneTo(container: IContainer): IAttributeParser {
    const newInterpreter = new SyntaxInterpreter();
    const patterns = container.getAll(IAttributePattern, true);
    const childParser = new AttributeParser(
      newInterpreter,
      patterns.slice(0)
    );
    Registration.instance(ISyntaxInterpreter, newInterpreter).register(container);
    Registration.instance(IAttributeParser, childParser).register(container);
    return childParser;
  }
}
