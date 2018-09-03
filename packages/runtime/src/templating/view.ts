import { DI, Reporter } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { IBindScope } from '../binding/observation';
import { DOM, INode, INodeSequence } from '../dom';
import { IAnimator } from './animator';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { IRenderContext } from './render-context';
import { IRenderable } from './renderable';
import { ITemplate } from './template';

export type RenderCallback = (view: IView) => void;

export interface IView extends IBindScope, IRenderable, IAttach {
  readonly factory: IViewFactory;

  onRender: RenderCallback;
  renderState: any;

  tryReturnToCache(): boolean;
}

export interface IViewFactory {
  readonly name: string;
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  create(): IView;
}

export const IViewFactory = DI.createInterface<IViewFactory>().noDefault();

/*@internal*/
export class View implements IView {
  public $bindables: IBindScope[] = [];
  public $attachables: IAttach[] = [];
  public $scope: IScope = null;
  public $nodes: INodeSequence = null;
  public $isBound: boolean = false;
  public $isAttached: boolean = false;
  public $context: IRenderContext;
  public onRender: RenderCallback;
  public renderState: any;
  public inCache: boolean = false;

  private animationRoot: INode;

  constructor(public factory: ViewFactory, private template: ITemplate, private animator: IAnimator) {
    this.$nodes = this.createNodes();
  }

  public createNodes(): INodeSequence {
    return this.template.createFor(this);
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$scope = scope;
    const bindables = this.$bindables;

    for (let i = 0, ii = bindables.length; i < ii; ++i) {
      bindables[i].$bind(flags, scope);
    }

    this.$isBound = true;
  }

  public $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }

    lifecycle = AttachLifecycle.start(this, lifecycle);

    const attachables = this.$attachables;

    for (let i = 0, ii = attachables.length; i < ii; ++i) {
      attachables[i].$attach(encapsulationSource, lifecycle);
    }

    this.onRender(this);
    this.$isAttached = true;
    lifecycle.end(this);
  }

  public $detach(lifecycle?: DetachLifecycle): void {
    if (this.$isAttached) {
      lifecycle = DetachLifecycle.start(this, lifecycle);
      lifecycle.queueViewRemoval(this);

      const attachables = this.$attachables;
      let i = attachables.length;

      while (i--) {
        attachables[i].$detach(lifecycle);
      }

      this.$isAttached = false;
      lifecycle.end(this);
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

  public tryReturnToCache(): boolean {
    return this.factory.tryReturnToCache(this);
  }

  private getAnimationRoot(): INode {
    if (this.animationRoot !== undefined) {
      return this.animationRoot;
    }

    let currentChild = this.$nodes.firstChild;
    const lastChild = this.$nodes.lastChild;
    const isElementNodeType = DOM.isElementNodeType;

    while (currentChild !== lastChild && !isElementNodeType(currentChild)) {
      currentChild = currentChild.nextSibling;
    }

    if (currentChild && isElementNodeType(currentChild)) {
      return this.animationRoot = DOM.hasClass(currentChild, 'au-animate')
        ? currentChild
        : null;
    }

    return this.animationRoot = null;
  }
}

/*@internal*/
export class ViewFactory implements IViewFactory {
  public isCaching: boolean = false;

  private cacheSize: number = -1;
  private cache: View[] = null;

  constructor(public name: string, private template: ITemplate, private animator: IAnimator) {}

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    if (size) {
      if (size === '*') {
        size = Number.MAX_VALUE;
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

  public tryReturnToCache(view: View): boolean {
    if (this.cache !== null && this.cache.length < this.cacheSize) {
      view.inCache = true;
      this.cache.push(view);
      return true;
    }

    return false;
  }

  public create(): IView {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      const view = cache.pop();
      view.inCache = false;
      return view;
    }

    return new View(this, this.template, this.animator);
  }
}
