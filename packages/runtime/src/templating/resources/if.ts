import { inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding';
import { DOM, INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle, Lifecycle, LifecycleFlags } from '../lifecycle';
import { IView, IViewFactory } from '../view';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean = false;

  public elseFactory: IViewFactory;

  private ifView: IView = null;
  private elseView: IView = null;
  private currentView: IView = null;
  private encapsulationSource: INode;

  constructor(public ifFactory: IViewFactory, private location: IRenderLocation) {}

  public binding(): void {
    this.updateView(LifecycleFlags.skipAnimation);

    if (this.currentView !== null) {
      this.currentView.$bind(BindingFlags.fromBind, this.$scope);
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
    if (this.ifView !== null && this.ifView.release()) {
      this.ifView = null;
    }

    if (this.elseView !== null && this.elseView.release()) {
      this.elseView = null;
    }

    this.currentView = null;
  }

  public valueChanged(): void {
    this.updateView(LifecycleFlags.none);
  }

  private updateView(detachFlags: LifecycleFlags): void {
    if (this.value) {
      if (this.currentView === this.elseView) {
        this.detachAndUnbindCurrentView(detachFlags);
      }

      this.currentView = this.ifView = this.ensureView(this.ifView, this.ifFactory);
      this.bindAndAttachCurrentView();
    } else if (this.elseFactory) {
      if (this.currentView === this.ifView) {
        this.detachAndUnbindCurrentView(detachFlags);
      }

      this.currentView = this.elseView  = this.ensureView(this.elseView, this.elseFactory);
      this.bindAndAttachCurrentView();
    } else {
      this.detachAndUnbindCurrentView(detachFlags);
    }
  }

  private bindAndAttachCurrentView(): void {
    if (this.$isBound) {
      this.currentView.$bind(BindingFlags.fromBindableHandler, this.$scope);
    }

    if (this.$isAttached) {
      Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none)
        .attach(this.currentView)
        .end();
    }
  }

  private detachAndUnbindCurrentView(detachFlags: LifecycleFlags): void {
    if (this.currentView !== null) {
      const flags = detachFlags | LifecycleFlags.unbindAfterDetached;

      Lifecycle.beginDetach(flags)
        .detach(this.currentView)
        .end();
    }
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
