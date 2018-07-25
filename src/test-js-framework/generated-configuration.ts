import { PLATFORM } from './../kernel/platform';
import { Repeater } from '../runtime/templating/resources/repeater';
import { AccessScope, IExpression, AccessMember, CallScope, Conditional, Binary, PrimitiveLiteral } from "../runtime/binding/ast";
import { IContainer } from "../kernel/di";
import { IExpressionParser } from "../runtime/binding/expression-parser";
//import { Repeat } from "../runtime/templating/resources/repeat/repeat";

const emptyArray = PLATFORM.emptyArray;

const expressionCache: Record<string, IExpression> = {
  ['store.data']: new AccessMember(new AccessScope('store'), 'data'),
  [`item.id===$parent.store.selected?'danger':''`]: new Conditional(
    new Binary('===',
      new AccessMember(new AccessScope('item'), 'id'),
      new AccessMember(new AccessScope('store'), 'selected')),
    new PrimitiveLiteral('danger'),
    new PrimitiveLiteral('')),
  ['item.id']: new AccessMember(new AccessScope('item'), 'id'),
  ['item.label']: new AccessMember(new AccessScope('item'), 'label'),
  ['run']: new CallScope('run', emptyArray),
  ['runLots']: new CallScope('runLots', emptyArray),
  ['add']: new CallScope('add', emptyArray),
  ['update']: new CallScope('update', emptyArray),
  ['clear']: new CallScope('clear', emptyArray),
  ['swapRows']: new CallScope('swapRows', emptyArray),
  ['$parent.select(item)']: new CallScope('select', [new AccessScope('item')]),
  ['$parent.remove(item)']: new CallScope('remove', [new AccessScope('item')])
};

const globalResources: any[] = [Repeater];

export const GeneratedConfiguration = {
  register(container: IContainer) {
    container.get(IExpressionParser).cache(expressionCache);
    container.register(...globalResources);
  }
};
