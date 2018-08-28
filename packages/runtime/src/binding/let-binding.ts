import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { IExpression } from './ast';
import { Binding } from './binding';
import { BindingContext, IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { BindingMode } from './binding-mode';
import { IObserverLocator } from './observer-locator';

const slotNames: string[] = new Array(100);
const versionSlotNames: string[] = new Array(100);

for (let i = 0; i < 100; i++) {
  slotNames[i] = `_observer${i}`;
  versionSlotNames[i] = `_observerVersion${i}`;
}

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

// tslint:disable:no-any
export class LetBinding extends Binding {

  constructor(
    sourceExpression: IExpression,
    targetProperty: string,
    mode: BindingMode,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
    private toViewModel: boolean = false
  ) {
    super(
      sourceExpression,
      null,
      targetProperty,
      mode,
      observerLocator,
      locator
    );
  }

  public updateTarget(value: any): void {
    this.sourceExpression.assign(BindingFlags.fromFlushChanges, this.target, this.locator, value);
  }

  public updateSource(value: any): void {
    throw new Error('Updating source not allow in Let binding.');
  }

  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;
    const target = this.target;

    if (flags & BindingFlags.updateTargetInstance) {
      if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
        sourceExpression.assign(flags, target, locator, newValue);
      }
      return;
    }

    throw Reporter.error(15, context);
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
    this.target = BindingContext.createScope(
      this.toViewModel ? scope.bindingContext : scope.overrideContext,
      scope.overrideContext
    );

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }

    const mode = this.mode;
    if ((mode & BindingMode.toView) !== BindingMode.toView) {
      throw new Error('Let binding only supports [toView] binding mode.');
    }
    sourceExpression.connect(flags, scope, this);
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
    this.updateTarget(value);

    sourceExpression.connect(flags, $scope, this);
  }
  //#endregion
}
// tslint:enable:no-any
