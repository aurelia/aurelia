import { IExpression, AccessScope, AccessMember, CallScope, CallMember } from './ast';
import { Reporter } from '@aurelia/kernel';
import { DI } from '@aurelia/kernel';
import { PLATFORM } from '@aurelia/kernel';

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
    try {
      const parts = expression.split('.');
      const firstPart = parts[0];
      let current: IExpression;

      if (firstPart.endsWith('()')) {
        current = new CallScope(firstPart.replace('()', ''), PLATFORM.emptyArray);
      } else {
        current = new AccessScope(parts[0]);
      }

      let index = 1;

      while(index < parts.length) {
        let currentPart = parts[index];

        if (currentPart.endsWith('()')) {
          current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
        } else {
          current = new AccessMember(current, parts[index]);
        }
        
        index++;
      }

      return current;
    } catch(e) {
      throw Reporter.error(3, e);
    }
  }
}
