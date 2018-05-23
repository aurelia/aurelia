import { IExpression } from './ast';
import { Reporter } from '../reporter';
import { DI } from '../di';

export interface IExpressionParser {
  cache(expressions: Record<string, IExpression>): void;
  parse(expression: string): IExpression;
}

export const IExpressionParser = DI.createInterface<IExpressionParser>()
  .withDefault(x => x.singleton(ExpressionParser));

class ExpressionParser implements IExpressionParser {
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
