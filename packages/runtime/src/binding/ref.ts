import { IServiceLocator } from '@aurelia/kernel';
import { IExpression } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';

export class Ref implements IBinding {
  public $isBound: boolean = false;
  private $scope: IScope;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public locator: IServiceLocator) {
  }

  public $bind(flags: BindingFlags, scope: IScope) {
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

  public $unbind(flags: BindingFlags) {
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

  public observeProperty(context: any, name: any) { }
}
