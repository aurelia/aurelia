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
  State,
} from '../../src/index';
import { AuDOM, AuNode, AuNodeSequence } from '../au-dom';

export class FakeView implements IView<AuNode> {
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

  public $nextUnbindAfterDetach: IComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes: INodeSequence<AuNode>;
  public $context: IRenderContext<AuNode>;
  public cache: IViewCache<AuNode>;
  public location: IRenderLocation<AuNode>;
  public isFree: boolean;

  public readonly $lifecycle: ILifecycle;

  constructor($lifecycle: ILifecycle) {
    this.$bindingHead = null;
    this.$bindingTail = null;

    this.$nextBinding = null;
    this.$prevBinding = null;

    this.$componentHead = null;
    this.$componentTail = null;

    this.$nextComponent = null;
    this.$prevComponent = null;

    this.$nextMount = null;
    this.$nextUnmount = null;

    this.$nextUnbindAfterDetach = null;

    this.$state = State.none;
    this.$scope = null;
    this.$nodes = new AuNodeSequence(new AuDOM(), AuNode.createTemplate().appendChild(AuNode.createText()));
    this.$context = null;
    this.cache = null;
    this.location = null;
    this.isFree = false;

    this.$lifecycle = $lifecycle;
  }

  public hold(location: IRenderLocation<AuNode>): void {
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

  public $patch(flags: LifecycleFlags): void {

  }
}
