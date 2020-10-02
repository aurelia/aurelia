import {
  IIndexable,
  IServiceLocator,
} from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import {
  LifecycleFlags,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IScope,
} from '../observation';
import {
  hasBind,
  hasUnbind,
} from './ast';
import { IConnectableBinding } from './connectable';

export interface RefBinding extends IConnectableBinding {}
export class RefBinding implements IBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: IScope = void 0;
  public part?: string;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    public target: object,
    public locator: IServiceLocator,
  ) {}

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;
    this.part = part;

    if (hasBind(this.sourceExpression)) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign!(flags | LifecycleFlags.updateSourceExpression, this.$scope, this.locator, this.target, part);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.evaluate(flags, this.$scope!, this.locator, this.part) === this.target) {
      sourceExpression.assign!(flags, this.$scope!, this.locator, null, this.part);
    }

    // source expression might have been modified durring assign, via a BB
    sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope = void 0;

    this.isBound = false;
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.sourceExpression = (void 0)!;
    this.locator = (void 0)!;
    this.target = (void 0)!;
  }
}
