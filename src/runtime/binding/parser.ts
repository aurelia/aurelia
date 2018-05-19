import { IExpression } from "./ast";
import { Reporter } from "../reporter";
import { DI } from "../di";

export interface IParser {
  cache(expressions: Record<string, IExpression>): void;
  parse(expression: string): IExpression;
}

export const IParser = DI.createInterface<IParser>()
  .withDefault(x => x.singleton(Parser));

class Parser implements IParser {
  private lookup: Record<string, IExpression> = Object.create(null);

  parse(expression: string): IExpression {
    let found = this.lookup[expression];
    
    if (found === undefined) {
      found = this.parseCore(expression);
      this.lookup[expression] = found;
    }

    return found;
  }

  cache(expressions: Record<string, IExpression>) {
    Object.assign(this.lookup, expressions);
  }

  private parseCore(expression: string): IExpression {
    throw Reporter.error(3);
  }
}
