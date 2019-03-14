import {
  IBinding,
  IComponent,
  ILifecycle,
  IMountableComponent,
  INodeSequence,
  IRenderContext,
  IRenderLocation,
  IScope,
  IView,
  IViewCache,
  LifecycleFlags,
  State
} from '@aurelia/runtime';
import { NodeSequenceFactory } from '../../src/dom';
import { HTMLTestContext } from '../util';

export class FakeView implements IView {
  public $bindingHead?: IBinding;
  public $bindingTail?: IBinding;

  public $nextBinding?: IBinding;
  public $prevBinding?: IBinding;

  public $componentHead?: IComponent;
  public $componentTail?: IComponent;

  public $nextComponent?: IComponent;
  public $prevComponent?: IComponent;

  public $nextMount?: IMountableComponent;
  public $nextUnmount?: IMountableComponent;

  public $nextUnbindAfterDetach?: IComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes: INodeSequence;
  public $context: IRenderContext;
  public cache: IViewCache;
  public location: IRenderLocation;
  public isFree: boolean;

  public readonly $lifecycle: ILifecycle;

  constructor(ctx: HTMLTestContext) {
    this.$state = State.none;
    this.$scope = null;
    this.$nodes = new NodeSequenceFactory(ctx.dom, '<div>Fake View</div>').createNodeSequence();
    this.$context = null;
    this.cache = null;
    this.location = null;
    this.isFree = false;

    this.$lifecycle = ctx.lifecycle;
  }

  public hold(location: IRenderLocation): void {
    this.location = location;
  }

  public release() {
    this.isFree = true;
    return false;
  }

  public lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$state |= State.isBound;
    };
    this.$unbind = () => {
      this.$state &= ~State.isBound;
    };
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    this.$scope = scope;
    this.$state |= State.isBound;
  }

  public $unbind(): void {
    this.$state &= ~State.isBound;
  }

  public $attach(): void {
    this.$lifecycle.enqueueMount(this);
    this.$state |= State.isAttached;
  }

  public $detach(): void {
    this.$lifecycle.enqueueUnmount(this);
    this.$state &= ~State.isAttached;
  }

  public $cache() { /* do nothing */ }

  public $mount() {
    this.$state |= State.isMounted;
    this.$nodes.insertBefore(this.location);
  }

  public $unmount() {
    this.$state &= ~State.isMounted;
    this.$nodes.remove();
  }
}
