import { DI, Reporter } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { IBindScope } from '../binding/observation';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { IAttach, IAttachLifecycle, IDetachLifecycle, IMountable } from './lifecycle';
import { IRenderContext } from './render-context';
import { IRenderable } from './renderable';
import { ITemplate } from './template';

export type RenderCallback = (view: IView) => void;

export interface IView extends IBindScope, IRenderable, IAttach, IMountable {
  readonly factory: IViewFactory;

  hold(location: IRenderLocation): void;
  release(): boolean;

  lockScope(scope: IScope): void;
}

export interface IViewFactory {
  readonly name: string;
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  create(): IView;
}

export const IViewFactory = DI.createInterface<IViewFactory>().noDefault();

/*@internal*/
export interface View extends IView {}

/*@internal*/
export class View implements IView {
  public $bindables: IBindScope[] = [];
  public $attachables: IAttach[] = [];
  public $scope: IScope = null;
  public $nodes: INodeSequence = null;
  public $isBound: boolean = false;
  public $isAttached: boolean = false;
  public $needsMount: boolean = false;
  public $isCached: boolean = false;
  public $context: IRenderContext;
  public location: IRenderLocation;
  private isFree: boolean = false;

  constructor(public factory: ViewFactory, private template: ITemplate) {
    this.$nodes = this.template.createFor(this);
  }

  public hold(location: IRenderLocation): void {
    if (!location.parentNode) { // unmet invariant: location must be a child of some other node
      throw Reporter.error(60); // TODO: organize error codes
    }
    this.location = location;
    const lastChild = this.$nodes.lastChild;
    this.$needsMount = !(lastChild && lastChild.nextSibling === location);
  }

  public lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = lockedBind;
  }

  public release(): boolean {
    this.isFree = true;
    if (this.$isAttached) {
      return this.factory.canReturnToCache(this);
    }

    return this.$unmount();
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags | BindingFlags.fromBind);
    }

    this.$scope = scope;
    const bindables = this.$bindables;

    for (let i = 0, ii = bindables.length; i < ii; ++i) {
      bindables[i].$bind(flags, scope);
    }

    this.$isBound = true;
  }

  public $mount(): void {
    this.$needsMount = false;
    this.$nodes.insertBefore(this.location);
  }

  public $unmount(): boolean {
    this.$needsMount = true;
    this.$nodes.remove();

    if (this.isFree) {
      this.isFree = false;
      return this.$isCached = this.factory.tryReturnToCache(this);
    }
    return false;
  }

  public $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }

    const attachables = this.$attachables;

    for (let i = 0, ii = attachables.length; i < ii; ++i) {
      attachables[i].$attach(encapsulationSource, lifecycle);
    }

    if (this.$needsMount === true) {
      lifecycle.queueMount(this);
    }

    this.$isAttached = true;
  }

  public $detach(lifecycle: IDetachLifecycle): void {
    if (this.$isAttached) {
      lifecycle.queueUnmount(this);

      const attachables = this.$attachables;
      let i = attachables.length;

      while (i--) {
        attachables[i].$detach(lifecycle);
      }

      this.$isAttached = false;
    }
  }

  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      const bindables = this.$bindables;
      let i = bindables.length;

      while (i--) {
        bindables[i].$unbind(flags);
      }

      this.$isBound = false;
      this.$scope = null;
    }
  }

  public $cache(): void {
    const attachables = this.$attachables;

    for (let i = 0, ii = attachables.length; i < ii; ++i) {
      attachables[i].$cache();
    }
  }
}

/*@internal*/
export class ViewFactory implements IViewFactory {
  public static maxCacheSize: number = 0xFFFF;
  public isCaching: boolean = false;

  private cacheSize: number = -1;
  private cache: View[] = null;

  constructor(public name: string, private template: ITemplate) {}

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
      view.$cache();
      this.cache.push(view);
      return true;
    }

    return false;
  }

  public create(): IView {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      const view = cache.pop();
      view.$isCached = false;
      return view;
    }

    return new View(this, this.template);
  }
}

function lockedBind(this: View, flags: BindingFlags): void {
  if (this.$isBound) {
    return;
  }

  const lockedScope = this.$scope;
  const bindables = this.$bindables;

  for (let i = 0, ii = bindables.length; i < ii; ++i) {
    bindables[i].$bind(flags, lockedScope);
  }

  this.$isBound = true;
}
