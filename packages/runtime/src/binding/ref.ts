import { IExpression } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IServiceLocator } from '../../kernel/di';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';

export class Ref implements IBinding {
  private $scope: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    public locator: IServiceLocator) {
  }

  $bind(flags: BindingFlags, scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
      this.sourceExpression.assign(flags, this.$scope, this.locator, null);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.$scope, null);
    }

    this.$scope = null;
  }

  observeProperty(context: any, name: any) { }
}
