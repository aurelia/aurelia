import { Reporter } from '../../kernel';
import { INodeSequence, IRenderLocation } from '../dom';
import { IAttach, IBindScope, ILifecycle, ILifecycleUnbind, IMountable, IRenderContext, IView, IViewCache, IViewFactory, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { $attachView, $cacheView, $detachView, $mountView, $unmountView } from './lifecycle-attach';
import { $bindView, $unbindView } from './lifecycle-bind';
import { ITemplate } from './lifecycle-render';
import { IFabricNodeSequence, IFabricRenderLocation } from '../three-dom';

/*@internal*/
export interface View extends IView {}

/*@internal*/
export class View implements IView {
  public $bindableHead: IBindScope = null;
  public $bindableTail: IBindScope = null;

  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $attachableHead: IAttach = null;
  public $attachableTail: IAttach = null;

  public $nextAttach: IAttach = null;
  public $prevAttach: IAttach = null;

  public $nextMount: IMountable = null;
  public $mountFlags: LifecycleFlags = 0;
  public $nextUnmount: IMountable = null;
  public $unmountFlags: LifecycleFlags = 0;

  public $nextUnbindAfterDetach: ILifecycleUnbind = null;

  public $state: State = State.none;
  public $scope: IScope = null;
  public $nodes: IFabricNodeSequence;
  public $context: IRenderContext;
  public location: IFabricRenderLocation;
  public isFree: boolean = false;

  constructor(
    public readonly $lifecycle: ILifecycle,
    public cache: IViewCache) {}

  public hold(location: IFabricRenderLocation, flags: LifecycleFlags): void {
    // if (!location.parentNode) { // unmet invariant: location must be a child of some other node
    //   throw Reporter.error(60); // TODO: organize error codes
    // }
    this.location = location;
    const lastChild = this.$nodes.lastChild;
    if (lastChild && lastChild.nextSibling === location) {
      this.$state &= ~State.needsMount;
    } else {
      this.$state |= State.needsMount;
    }
  }

  public lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = lockedBind;
  }

  public release(flags: LifecycleFlags): any {
    this.isFree = true;
    if (this.$state & State.isAttached) {
      return this.cache.canReturnToCache(this);
    }

    return this.$unmount(flags);
  }
}

/*@internal*/
export class ViewFactory implements IViewFactory {
  public static maxCacheSize: number = 0xFFFF;
  public isCaching: boolean = false;

  private cacheSize: number = -1;
  private cache: View[] = null;

  constructor(
    public name: string,
    private template: ITemplate,
    private lifecycle: ILifecycle
  ) {}

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

  public canReturnToCache(view: IView): boolean {
    return this.cache !== null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(view: View): boolean {
    if (this.canReturnToCache(view)) {
      view.$cache(LifecycleFlags.none);
      this.cache.push(view);
      return true;
    }

    return false;
  }

  public create(): IView {
    const cache = this.cache;
    let view: View;

    if (cache !== null && cache.length > 0) {
      view = cache.pop();
      view.$state &= ~State.isCached;
      return view;
    }

    view = new View(this.lifecycle, this);
    this.template.render(view);
    if (!view.$nodes) {
      throw Reporter.error(90);
    }
    return view;
  }
}

function lockedBind(this: View, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    return;
  }

  flags |= LifecycleFlags.fromBind;
  const lockedScope = this.$scope;
  let current = this.$bindableHead;
  while (current !== null) {
    current.$bind(flags, lockedScope);
    current = current.$nextBind;
  }

  this.$state |= State.isBound;
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
