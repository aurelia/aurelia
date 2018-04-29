import { IExpression } from "./ast";
import { IBinding, IBindingTarget } from "./binding";
import { IContainer } from "../di";
import { IScope } from "./binding-context";

export class Ref implements IBinding {
  private $scope: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    public container: IContainer) {
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

    this.sourceExpression.assign(this.$scope, this.target, this.container);
  }

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.evaluate(this.$scope, this.container) === this.target) {
      this.sourceExpression.assign(this.$scope, null, this.container);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope);
    }

    this.$scope = null;
  }

  observeProperty(context: any, name: any) { }
}
