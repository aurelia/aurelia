import {
  IIndexable,
  IServiceLocator,
  Tracer,
} from '@aurelia/kernel';

import { IsBindingBehavior } from '../ast';
import {
  LifecycleFlags,
  State,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IObservable,
  IScope,
} from '../observation';
import {
  hasBind,
  hasUnbind,
} from './ast';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface Ref extends IConnectableBinding {}
export class Ref implements IBinding {
  public $state: State;
  public $scope?: IScope;
  public part?: string;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public target: IObservable;

  constructor(
    sourceExpression: IsBindingBehavior,
    target: object,
    locator: IServiceLocator,
  ) {
    this.$state = State.none;
    this.$scope = void 0;

    this.locator = locator;
    this.sourceExpression = sourceExpression;
    this.target = target as IObservable;
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (Tracer.enabled) { Tracer.enter('Ref', '$bind', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        if (Tracer.enabled) { Tracer.leave(); }
        return;
      }

      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.part = part;

    if (hasBind(this.sourceExpression)) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign!(flags, this.$scope, this.locator, this.target, part);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Ref', '$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    if (this.sourceExpression.evaluate(flags, this.$scope!, this.locator, this.part) === this.target) {
      this.sourceExpression.assign!(flags, this.$scope!, this.locator, null, this.part);
    }

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope!, this);
    }

    this.$scope = void 0;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
