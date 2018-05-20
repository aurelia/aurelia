import { IParser } from '../../runtime/binding/parser';
import { IContainer } from '../../runtime/di';
import { IExpression } from '../../runtime/binding/ast';

export function register(container: IContainer) {
  container.registerTransformer(IParser, parser => {
    return Object.assign(parser, {
      parseCore(expression: string): IExpression {
        throw Error('Full expression parser not yet implemented.');
      }
    });
  });
}
