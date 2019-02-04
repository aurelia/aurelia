import { InterfaceSymbol, Reporter } from '@aurelia/kernel';
import {
  AccessScope,
  BindingType,
  IExpression,
  IExpressionParser,
  PrimitiveLiteral
} from '@aurelia/runtime';
import { ExpressionVisitor } from './expression-visitor';

export class ValidationMessageParser {
  public static readonly inject: InterfaceSymbol[] = [IExpressionParser];

  private readonly cache: { [message: string]: IExpression };
  private readonly parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.cache = {};
    this.parser = parser;
  }

  public parse(message: string): IExpression {
    if (this.cache[message] !== undefined) {
      return this.cache[message];
    }

    const interpolation = this.parser.parse(message, BindingType.Interpolation);
    if (interpolation === null) {
      return new PrimitiveLiteral(message);
    }
    MessageExpressionValidator.validate(interpolation, message);

    this.cache[message] = interpolation;

    return interpolation;
  }
}

export class MessageExpressionValidator extends ExpressionVisitor {
  private readonly originalMessage: string;

  constructor(originalMessage: string) {
    super();
    this.originalMessage = originalMessage;
  }

  public static validate(expression: IExpression, originalMessage: string): void {
    const visitor = new MessageExpressionValidator(originalMessage);
    expression.accept(visitor);
  }

  public visitAccessScope(access: AccessScope): void {
    if (access.ancestor !== 0) {
      throw new Error('$parent is not permitted in validation message expressions.');
    }
    if (['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'].indexOf(access.name) !== -1) {
      Reporter.write(1200); // TODO: create error code
      // LogManager.getLogger('aurelia-validation')
      //   // tslint:disable-next-line:max-line-length
      //   .warn(`Did you mean to use "$${access.name}" instead of "${access.name}" in this validation message template: "${this.originalMessage}"?`);
    }
  }
}
