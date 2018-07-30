import { AccessScope, HtmlLiteral, PrimitiveLiteral, Conditional, CallScope, IExpression, AccessMember } from "../runtime/binding/ast";
import { IContainer } from "../kernel/di";
import { IExpressionParser } from "../runtime/binding/expression-parser";
import { Repeat } from "../runtime/templating/resources/repeat/repeat";
import { If } from "../runtime/templating/resources/if";
import { Else } from "../runtime/templating/resources/else";

const emptyArray: any[] = [];

const expressionCache: Record<string, IExpression> = {
  message: new AccessScope('message'),
  textContent: new AccessScope('textContent'),
  value: new AccessScope('value'),
  nameTagBorderWidth: new AccessScope('borderWidth'),
  nameTagBorderColor: new AccessScope('borderColor'),
  nameTagBorder: new HtmlLiteral([
    new AccessScope('borderWidth'),
    new PrimitiveLiteral('px solid '),
    new AccessScope('borderColor')
  ]),
  nameTagHeaderVisible: new AccessScope('showHeader'),
  nameTagClasses: new HtmlLiteral([
    new PrimitiveLiteral('au name-tag '),
    new Conditional(
      new AccessScope('showHeader'),
      new PrimitiveLiteral('header-visible'),
      new PrimitiveLiteral('')
    )
  ]),
  name: new AccessScope('name'),
  submit: new CallScope('submit', emptyArray, 0),
  nameTagColor: new AccessScope('color'),
  duplicateMessage: new AccessScope('duplicateMessage'),
  checked: new AccessScope('checked'),
  nameTag: new AccessScope('nameTag'),
  todos: new AccessScope('todos'),
  addTodo: new CallScope('addTodo', emptyArray, 0),
  description: new AccessMember(new AccessScope('todo'), 'description')
};

const globalResources: any[] = [Repeat, If, Else];

export const GeneratedConfiguration = {
  register(container: IContainer) {
    container.get(IExpressionParser).cache(expressionCache);
    container.register(...globalResources);
  }
};
