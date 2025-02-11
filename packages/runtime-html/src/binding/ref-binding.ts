import type { IServiceLocator } from '@aurelia/kernel';
import {
  type ICollectionSubscriber,
  type IObserverLocatorBasedConnectable,
  type ISubscriber,
  type Scope,
  type IAstEvaluator,
  connectable,
  IObserverLocator,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixingBindingLimited, mixinUseScope } from './binding-utils';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
import { bindingHandleChange, bindingHandleCollectionChange } from './_lifecycle';

export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    connectable(RefBinding, null!);
    mixingBindingLimited(RefBinding, () => 'updateSource');
    mixinUseScope(RefBinding);
    mixinAstEvaluator(RefBinding);
  });

  public get $kind() { return 'Ref' as const; }

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  public l: IServiceLocator;

  public constructor(
    locator: IServiceLocator,
    public oL: IObserverLocator,
    public ast: IsBindingBehavior,
    public target: object,
    public strict: boolean,
  ) {
    this.l = locator;
  }

  public handleChange(): void {
    // TODO: see if we can get rid of this by integrating this call in connectable
    bindingHandleChange(this);
  }

  public handleCollectionChange(): void {
    bindingHandleCollectionChange(this);
  }
}
