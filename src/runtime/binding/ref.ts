import { IExpression } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IServiceLocator } from '../di';
import { IScope } from './binding-context';

export class Ref implements IBinding {
  private $scope: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    public locator: IServiceLocator) {
  }

  $bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope);
    }

    this.sourceExpression.assign(this.$scope, this.target, this.locator);
  }

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.evaluate(this.$scope, this.locator) === this.target) {
      this.sourceExpression.assign(this.$scope, null, this.locator);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope);
    }

    this.$scope = null;
  }

  observeProperty(context: any, name: any) { }
}
