import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { IExpression } from './ast';
import { Binding } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { BindingMode } from './binding-mode';
import { IObserverLocator } from './observer-locator';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { toView } = BindingMode;

// tslint:disable:no-any
export class LetBinding extends Binding {

  constructor(
    sourceExpression: IExpression,
    targetProperty: string,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
    private toViewModel: boolean = false
  ) {
    super(
      sourceExpression,
      null,
      targetProperty,
      toView,
      observerLocator,
      locator
    );
  }

  public updateTarget(value: any): void {
    throw new Error('Updating target not allowed in LetBinding.');
  }

  public updateSource(value: any): void {
    throw new Error('Updating source not allowed in LetBinding.');
  }

  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;
    const target = this.target;
    const targetProperty = this.targetProperty;

    if (flags & BindingFlags.updateTargetInstance) {
      const currValue = target[targetProperty];
      const newValue = sourceExpression.evaluate(flags, $scope, locator);
      if (newValue !== currValue) {
        target[targetProperty] = newValue;
      }
      return;
    }

    throw Reporter.error(15, flags);
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
    this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(BindingFlags.fromBind, scope, this.locator);

    const mode = this.mode;
    if ((mode & toView) !== toView) {
      throw new Error('Let binding only supports [toView] binding mode.');
    }
    this.sourceExpression.connect(flags, scope, this);
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }
    this.$isBound = false;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;
    this.unobserve(true);
  }

  public connect(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;

    const value = sourceExpression.evaluate(flags, $scope, this.locator);
    // Let binding should initialize on their own
    // not waiting to be intied
    this.target[this.targetProperty] = value;

    sourceExpression.connect(flags, $scope, this);
  }
  //#endregion
}
// tslint:enable:no-any
