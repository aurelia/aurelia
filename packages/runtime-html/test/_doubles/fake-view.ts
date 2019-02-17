import {
  IBinding,
  IComponent,
  ILifecycle,
  ILifecycleTask,
  IMountableComponent,
  INodeSequence,
  IRenderContext,
  IRenderLocation,
  IScope,
  IView,
  IViewCache,
  LifecycleFlags,
  LifecycleTask,
  State
} from '@aurelia/runtime';
import { NodeSequenceFactory } from '../../src/dom';
import { HTMLTestContext } from '../util';

export class FakeView implements IView {
  public $bindingHead: IBinding;
  public $bindingTail: IBinding;

  public $nextBinding: IBinding;
  public $prevBinding: IBinding;

  public $componentHead: IComponent;
  public $componentTail: IComponent;

  public $nextComponent: IComponent;
  public $prevComponent: IComponent;

  public $nextMount: IMountableComponent;
  public $nextUnmount: IMountableComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes: INodeSequence;
  public $context: IRenderContext;
  public cache: IViewCache;
  public location: IRenderLocation;
  public isFree: boolean;

  public readonly $lifecycle: ILifecycle;

  constructor(ctx: HTMLTestContext) {
    this.$bindingHead = null;
    this.$bindingTail = null;

    this.$componentHead = null;
    this.$componentTail = null;

    this.$nextBinding = null;
    this.$prevBinding = null;

    this.$componentHead = null;
    this.$componentTail = null;

    this.$nextComponent = null;
    this.$prevComponent = null;

    this.$nextMount = null;
    this.$nextUnmount = null;

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
      return LifecycleTask.done;
    };
    this.$unbind = () => {
      this.$state &= ~State.isBound;
      return LifecycleTask.done;
    };
  }

  public $bind(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    this.$scope = scope;
    this.$state |= State.isBound;
    return LifecycleTask.done;
  }

  public $patch(flags: LifecycleFlags): void { /* do nothing */ }

  public $unbind(flags: LifecycleFlags): ILifecycleTask {
    this.$state &= ~State.isBound;
    return LifecycleTask.done;
  }

  public $attach(flags: LifecycleFlags): ILifecycleTask {
    this.$lifecycle.beginAttach(this);
    this.$lifecycle.enqueueMount(this);
    this.$lifecycle.endAttach(flags, this);
    return LifecycleTask.done;
  }

  public $detach(flags: LifecycleFlags): ILifecycleTask {
    this.$lifecycle.beginDetach(this);
    this.$lifecycle.enqueueUnmount(this);
    this.$lifecycle.endDetach(flags, this);
    return LifecycleTask.done;
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
