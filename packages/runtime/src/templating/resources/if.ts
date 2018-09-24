import { inject } from '@aurelia/kernel';
import { BindingFlags, IBindScope, IScope } from '../../binding';
import { DOM, INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { AggregateLifecycleTask, IAttach, IAttachLifecycle, IDetachLifecycle, ILifecycleTask, Lifecycle, LifecycleFlags } from '../lifecycle';
import { IView, IViewFactory } from '../view';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean = false;

  public elseFactory: IViewFactory = null;

  private ifView: IView = null;
  private elseView: IView = null;
  private coordinator: CompositionCoordinator;

  constructor(public ifFactory: IViewFactory, private location: IRenderLocation) {
    this.coordinator = new CompositionCoordinator(this);
  }

  public binding(): void {
    this.updateView();
    this.coordinator.binding(this.$scope);
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    this.coordinator.attaching(encapsulationSource, lifecycle);
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    this.coordinator.detaching(lifecycle);
  }

  public unbinding(): void {
    this.coordinator.unbinding();
  }

  public caching(): void {
    if (this.ifView !== null && this.ifView.release()) {
      this.ifView = null;
    }

    if (this.elseView !== null && this.elseView.release()) {
      this.elseView = null;
    }

    this.coordinator.caching();
  }

  public valueChanged(): void {
    this.updateView();
  }

  private updateView(): void {
    let view: IView;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory);
    } else {
      view = null;
    }

    this.coordinator.compose(view);
  }

  private ensureView(view: IView, factory: IViewFactory): IView {
    if (view === null) {
      view = factory.create();
    }

    view.mount(this.location);

    return view;
  }
}

@templateController('else')
@inject(IViewFactory, IRenderLocation)
export class Else {
  constructor(private factory: IViewFactory, location: IRenderLocation) {
    DOM.remove(location); // Only the location of the "if" is relevant.
  }

  public link(ifBehavior: If): void {
    ifBehavior.elseFactory = this.factory;
  }
}

class CompositionCoordinator {
  private viewQueue: IView[] = null;
  private currentView: IView = null;
  private swapTask: ILifecycleTask = Lifecycle.done;
  private encapsulationSource: INode;
  private scope: IScope;

  constructor(private owner: IAttach & IBindScope) {}

  public compose(view: IView): void {
    if (this.swapTask.done) {
      this.process(view);
    } else {
      this.enqueue(view);

      if (this.swapTask.canCancel()) {
        this.swapTask.cancel();
      }
    }
  }

  public binding(scope: IScope): void {
    this.scope = scope;

    if (this.currentView !== null) {
      this.currentView.$bind(BindingFlags.fromBind, scope);
    }
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    this.encapsulationSource = encapsulationSource;

    if (this.currentView !== null) {
      this.currentView.$attach(encapsulationSource, lifecycle);
    }
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    if (this.currentView !== null) {
      this.currentView.$detach(lifecycle);
    }
  }

  public unbinding(): void {
    if (this.currentView !== null) {
      this.currentView.$unbind(BindingFlags.fromUnbind);
    }
  }

  public caching(): void {
    this.currentView = null;
  }

  private enqueue(view: IView): void {
    if (this.viewQueue === null) {
      this.viewQueue = [];
    }

    this.viewQueue.push(view);
  }

  private process(view: IView): void {
    if (this.currentView === view) {
      return;
    }

    const swapTask = new AggregateLifecycleTask();

    swapTask.addTask(
      this.detachAndUnbindCurrentView(
        this.owner.$isAttached
          ? LifecycleFlags.none
          : LifecycleFlags.noTasks
      )
    );

    this.currentView = view;

    swapTask.addTask(
      this.bindAndAttachCurrentView()
    );

    if (swapTask.done) {
      this.swapTask = Lifecycle.done;
    } else {
      this.swapTask = swapTask;
      this.swapTask.wait().then(() => this.processNext());
    }
  }

  private processNext(): void {
    if (this.viewQueue !== null && this.viewQueue.length > 0) {
      const nextView = this.viewQueue.pop();
      this.viewQueue.length = 0;
      this.process(nextView);
    } else {
      this.swapTask = Lifecycle.done;
    }
  }

  private detachAndUnbindCurrentView(detachFlags: LifecycleFlags): ILifecycleTask {
    if (this.currentView === null) {
      return Lifecycle.done;
    }

    return Lifecycle.beginDetach(detachFlags | LifecycleFlags.unbindAfterDetached)
      .detach(this.currentView)
      .end();
  }

  private bindAndAttachCurrentView(): ILifecycleTask {
    if (this.currentView === null) {
      return Lifecycle.done;
    }

    if (this.owner.$isBound) {
      this.currentView.$bind(BindingFlags.fromBindableHandler, this.scope);
    }

    if (this.owner.$isAttached) {
      return Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none)
        .attach(this.currentView)
        .end();
    }

    return Lifecycle.done;
  }
}
