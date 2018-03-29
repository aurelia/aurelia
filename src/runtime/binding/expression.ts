import { IExpression } from "./ast";

const cache = <Record<string, IExpression>>Object.create(null);

export const Expression = {
  from(expression: string): IExpression {
    let found = cache[expression];
    
    if (found === undefined) {
      found = this.compile(expression);
      cache[expression] = found;
    }

    return found;
  },
  primeCache(expressionCache: Record<string, IExpression>) {
    Object.assign(cache, expressionCache);
  }
};

(<any>Expression).compile = function(expression: string): IExpression {
  throw new Error('Runtime expression compilation is only available when including designtime support.')
};
