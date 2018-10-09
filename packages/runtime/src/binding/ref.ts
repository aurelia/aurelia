import { IServiceLocator } from '@aurelia/kernel';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IConnectableBinding } from './connectable';

export interface Ref extends IConnectableBinding {}
export class Ref implements IBinding {
  public $isBound: boolean = false;
  public $scope: IScope;

  constructor(
    public sourceExpression: IsBindingBehavior,
    public target: IBindingTarget,
    public locator: IServiceLocator) {
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
      this.sourceExpression.assign(flags, this.$scope, this.locator, null);
    }

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
  }
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void { }
  // tslint:enable:no-empty no-any
}
