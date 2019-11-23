import {
  Expression,
  AccessScope,
  LiteralString,
  Binary,
  Conditional,
  LiteralPrimitive,
  CallMember
} from 'aurelia-binding';
import { BindingLanguage } from 'aurelia-templating';
import * as LogManager from 'aurelia-logging';
import { ExpressionVisitor } from './expression-visitor';

export class ValidationMessageParser {
  public static inject = [BindingLanguage];

  private emptyStringExpression = new LiteralString('');
  private nullExpression = new LiteralPrimitive(null);
  private undefinedExpression = new LiteralPrimitive(undefined);
  private cache: { [message: string]: Expression } = {};

  constructor(private bindinqLanguage: BindingLanguage) { }

  public parse(message: string): Expression {
    if (this.cache[message] !== undefined) {
      return this.cache[message];
    }

    const parts: (Expression | string)[] | null = (this.bindinqLanguage as any).parseInterpolation(null, message);
    if (parts === null) {
      return new LiteralString(message);
    }
    let expression: Expression = new LiteralString(parts[0] as string);
    for (let i = 1; i < parts.length; i += 2) {
      expression = new Binary(
        '+',
        expression,
        new Binary(
          '+',
          this.coalesce(parts[i] as Expression),
          new LiteralString(parts[i + 1] as string)
        )
      );
    }

    MessageExpressionValidator.validate(expression, message);

    this.cache[message] = expression;

    return expression;
  }

  private coalesce(part: Expression): Expression {
    // part === null || part === undefined ? '' : part
    return new Conditional(
      new Binary(
        '||',
        new Binary('===', part, this.nullExpression),
        new Binary('===', part, this.undefinedExpression)
      ),
      this.emptyStringExpression,
      new CallMember(part, 'toString', [])
    );
  }
}

export class MessageExpressionValidator extends ExpressionVisitor {
  public static validate(expression: Expression, originalMessage: string) {
    const visitor = new MessageExpressionValidator(originalMessage);
    expression.accept(visitor);
  }

  constructor(private originalMessage: string) {
    super();
  }

  public visitAccessScope(access: AccessScope) {
    if (access.ancestor !== 0) {
      throw new Error('$parent is not permitted in validation message expressions.');
    }
    if (['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'].indexOf(access.name) !== -1) {
      LogManager.getLogger('aurelia-validation')
        // tslint:disable-next-line:max-line-length
        .warn(`Did you mean to use "$${access.name}" instead of "${access.name}" in this validation message template: "${this.originalMessage}"?`);
    }
  }
}
