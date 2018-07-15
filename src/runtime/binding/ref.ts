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

  $bind(scope: IScope, flags: BindingFlags) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope, flags);
    }

    this.sourceExpression.assign(this.$scope, this.target, this.locator, flags);
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.evaluate(this.$scope, this.locator, flags) === this.target) {
      this.sourceExpression.assign(this.$scope, null, this.locator, flags);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope, flags);
    }

    this.$scope = null;
  }

  observeProperty(context: any, name: any) { }
}
