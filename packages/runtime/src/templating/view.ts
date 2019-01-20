import { Reporter, Tracer } from '@aurelia/kernel';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags, State } from '../flags';
import {
  IBinding,
  IComponent,
  ILifecycle,
  IMountableComponent,
  IRenderContext,
  IView,
  IViewCache,
  IViewFactory
} from '../lifecycle';
import { IScope } from '../observation';
import { ITemplate } from '../rendering-engine';
import { $attachView, $cacheView, $detachView, $mountView, $unmountView } from './lifecycle-attach';
import { $bindView, $lockedBind, $lockedUnbind, $unbindView } from './lifecycle-bind';

const slice = Array.prototype.slice;

/** @internal */
export interface View<T extends INode = INode> extends IView<T> {}

/** @internal */
export class View<T extends INode = INode> implements IView<T> {
  public $bindingHead: IBinding;
  public $bindingTail: IBinding;

  public $componentHead: IComponent;
  public $componentTail: IComponent;

  public $nextComponent: IComponent;
  public $prevComponent: IComponent;

  public $nextMount: IMountableComponent;
  public $nextUnmount: IMountableComponent;

  public $nextUnbindAfterDetach: IComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes: INodeSequence<T>;
  public $context: IRenderContext<T>;
  public cache: IViewCache<T>;
  public location: IRenderLocation<T>;
  public isFree: boolean;

  public readonly $lifecycle: ILifecycle;

  constructor($lifecycle: ILifecycle, cache: IViewCache<T>) {
    this.$bindingHead = null;
    this.$bindingTail = null;

    this.$componentHead = null;
    this.$componentTail = null;

    this.$componentHead = null;
    this.$componentTail = null;

    this.$nextComponent = null;
    this.$prevComponent = null;

    this.$nextMount = null;
    this.$nextUnmount = null;

    this.$nextUnbindAfterDetach = null;

    this.$state = State.none;
    this.$scope = null;
    this.isFree = false;

    this.$lifecycle = $lifecycle;
    this.cache = cache;
  }

  /**
   * Reserves this `View` for mounting at a particular `IRenderLocation`.
   * Also marks this `View` such that it cannot be returned to the cache until
   * it is released again.
   *
   * @param location The RenderLocation before which the view will be appended to the DOM.
   */
  public hold(location: IRenderLocation<T>): void {
    if (Tracer.enabled) { Tracer.enter('View.hold', slice.call(arguments)); }
    this.isFree = false;
    this.location = location;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  /**
   * Marks this `View` such that it can be returned to the cache when it is unmounted.
   *
   * If this `View` is not currently attached, it will be unmounted immediately.
   *
   * @param flags The `LifecycleFlags` to pass to the unmount operation (only effective
   * if the view is already in detached state).
   *
   * @returns Whether this `View` can/will be returned to cache
   */
  public release(flags: LifecycleFlags): boolean {
    if (Tracer.enabled) { Tracer.enter('View.release', slice.call(arguments)); }
    this.isFree = true;
    if (this.$state & State.isAttached) {
      if (Tracer.enabled) { Tracer.leave(); }
      return this.cache.canReturnToCache(this);
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return !!this.$unmount(flags);
  }

  public lockScope(scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('View.lockScope', slice.call(arguments)); }
    this.$scope = scope;
    this.$bind = $lockedBind;
    this.$unbind = $lockedUnbind;
    if (Tracer.enabled) { Tracer.leave(); }
  }

}

/** @internal */
export class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static maxCacheSize: number = 0xFFFF;

  public isCaching: boolean;
  public name: string;

  private cache: View<T>[];
  private cacheSize: number;
  private readonly lifecycle: ILifecycle;
  private readonly template: ITemplate<T>;

  constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle) {
    this.isCaching = false;

    this.cacheSize = -1;
    this.cache = null;
    this.lifecycle = lifecycle;
    this.name = name;
    this.template = template;
  }

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    if (size) {
      if (size === '*') {
        size = ViewFactory.maxCacheSize;
      } else if (typeof size === 'string') {
        size = parseInt(size, 10);
      }

      if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
        this.cacheSize = size;
      }
    }

    if (this.cacheSize > 0) {
      this.cache = [];
    } else {
      this.cache = null;
    }

    this.isCaching = this.cacheSize > 0;
  }

  public canReturnToCache(view: IView<T>): boolean {
    return this.cache !== null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(view: View<T>): boolean {
    if (this.canReturnToCache(view)) {
      view.$cache(LifecycleFlags.none);
      this.cache.push(view);
      return true;
    }

    return false;
  }

  public create(flags?: LifecycleFlags): IView<T> {
    const cache = this.cache;
    let view: View<T>;

    if (cache !== null && cache.length > 0) {
      view = cache.pop();
      view.$state &= ~State.isCached;
      return view;
    }

    view = new View<T>(this.lifecycle, this);
    this.template.render(view, null, null, flags);
    if (!view.$nodes) {
      throw Reporter.error(90);
    }
    return view;
  }
}

((proto: IView): void => {
  proto.$bind = $bindView;
  proto.$unbind = $unbindView;
  proto.$attach = $attachView;
  proto.$detach = $detachView;
  proto.$cache = $cacheView;
  proto.$mount = $mountView;
  proto.$unmount = $unmountView;
})(View.prototype);
