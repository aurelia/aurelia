import { inject } from '@aurelia/kernel';
import { templateController } from '../../custom-attribute';
import { IRenderLocation } from '../../dom';
import { Lifecycle } from '../../lifecycle';
import { ICustomAttribute } from '../../lifecycle-render';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation, CompositionCoordinator)
export class If {
  @bindable public value: boolean = false;

  public elseFactory: IViewFactory = null;

  public ifView: IView = null;
  public elseView: IView = null;

  constructor(
    public ifFactory: IViewFactory,
    public location: IRenderLocation,
    public coordinator: CompositionCoordinator) { }

  public binding(flags: LifecycleFlags): void {
    const view = this.updateView(flags);
    this.coordinator.compose(view, flags);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(flags: LifecycleFlags): void {
    this.coordinator.attaching(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.coordinator.detaching(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.coordinator.unbinding(flags);
  }

  public caching(flags: LifecycleFlags): void {
    if (this.ifView !== null && this.ifView.release(flags)) {
      this.ifView = null;
    }

    if (this.elseView !== null && this.elseView.release(flags)) {
      this.elseView = null;
    }

    this.coordinator.caching(flags);
  }

  public valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void {
    if (flags & LifecycleFlags.fromFlush) {
      const view = this.updateView(flags);
      this.coordinator.compose(view, flags);
    } else {
      this.$lifecycle.queueFlush(this);
    }
  }

  public flush(flags: LifecycleFlags): void {
    const view = this.updateView(flags);
    this.coordinator.compose(view, flags);
  }

  private updateView(flags: LifecycleFlags): IView {
    let view: IView;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = null;
    }

    return view;
  }

  private ensureView(view: IView, factory: IViewFactory, flags: LifecycleFlags): IView {
    if (view === null) {
      view = factory.create();
    }

    view.hold(this.location, flags);

    return view;
  }
}

@templateController('else')
@inject(IViewFactory)
export class Else {
  constructor(private factory: IViewFactory) { }

  public link(ifBehavior: If): void {
    ifBehavior.elseFactory = this.factory;
  }
}
