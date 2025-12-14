import { type Writable, isString, resolve } from '@aurelia/kernel';
import { type IOverrideContext, type ISubscriber, Scope } from '@aurelia/runtime';
import { BindingBehavior, type IBinding } from '@aurelia/runtime-html';
import { IStore, IStoreRegistry, type IStoreSubscriber } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope } from './state-utilities';

export class StateBindingBehavior {

  /** @internal */ private readonly _defaultStore = resolve(IStore);
  /** @internal */ private readonly _storeRegistry = resolve(IStoreRegistry);
  /** @internal */ private readonly _subs: WeakMap<IBinding, StateSubscriber> = new WeakMap();

  public bind(scope: Scope, binding: IBinding, storeOrName?: string | IStore<object>): void {
    const isStateBinding = binding instanceof StateBinding;
    const store = storeOrName == null || isString(storeOrName) ? this._storeRegistry.getStore(storeOrName ?? 'default') : storeOrName;
    const effectiveScope = isStateBinding ? scope : createStateBindingScope(store.getState(), scope);

    if (!isStateBinding) {
      const sub = this._subs.get(binding);
      if (sub != null) {
        sub.stop();
      }
      const subscriber = new StateSubscriber(binding, effectiveScope, store);
      this._subs.set(binding, subscriber);
      store.subscribe(subscriber);
      if (__DEV__ && !binding.useScope) {
        // eslint-disable-next-line no-console
        console.warn(`[DEV:aurelia] Binding ${binding.constructor.name} does not support "state" binding behavior`);
      }
      binding.useScope?.(effectiveScope);
    }
  }

  public unbind(_scope: Scope, binding: IBinding): void {
    const sub = this._subs.get(binding);
    if (sub != null) {
      sub.stop();
    }
    this._subs.delete(binding);
  }
}
BindingBehavior.define('state', StateBindingBehavior);

class StateSubscriber implements IStoreSubscriber<object> {
  public constructor(
    private readonly binding: IBinding,
    public scope: Scope,
    private readonly store: IStore<object>,
  ) {
  }

  public handleStateChange(state: object): void {
    const overrideContext = this.scope.overrideContext as Writable<IOverrideContext>;
    this.scope.bindingContext = overrideContext.bindingContext = state;
    (this.binding as unknown as ISubscriber).handleChange?.(undefined, undefined);
  }

  public start(): void {
    this.store.subscribe(this);
  }

  public stop(): void {
    this.store.unsubscribe(this);
  }
}
