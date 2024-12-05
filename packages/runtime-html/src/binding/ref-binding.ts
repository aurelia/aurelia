import type { IServiceLocator } from '@aurelia/kernel';
import {
  type ICollectionSubscriber,
  type IObserverLocatorBasedConnectable,
  type ISubscriber,
  type Scope,
  type IAstEvaluator,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator } from './binding-utils';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
import { $bind, $unbind } from './_lifecycle';

export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
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
    public ast: IsBindingBehavior,
    public target: object,
    public strict: boolean,
  ) {
    this.l = locator;
  }

  public bind(scope: Scope): void {
    $bind(this, scope);
  }

  public unbind(): void {
    $unbind(this);
  }
}
