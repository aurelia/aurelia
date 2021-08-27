import { Writable } from '@aurelia/kernel';
import { BindingInterceptor, IInterceptableBinding, BindingBehaviorExpression, Scope, IsBindingBehavior } from '@aurelia/runtime';
import { bindingBehavior, LifecycleFlags } from '@aurelia/runtime-html';
import { StreamAstVisitor } from './ast';

export class SubscribeBindingBehavior extends BindingInterceptor {
  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    expr = StreamAstVisitor.rewrite(expr) as BindingBehaviorExpression;
    super(binding, expr);
    (binding as Writable<BindingInterceptor>).sourceExpression = expr;
  }

  public $bind(f: LifecycleFlags, s: Scope) {
    this.binding.$bind(f, s);
  }

  public $unbind(f: LifecycleFlags) {
    this.binding.$unbind(f);
  }
}

bindingBehavior('subscribe')(SubscribeBindingBehavior);
