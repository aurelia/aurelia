import { inject } from '@aurelia/kernel';
import { templateController } from '../../custom-attribute';
import { IRenderLocation } from '../../dom';
import { Lifecycle } from '../../lifecycle';
import { ICustomAttribute } from '../../lifecycle-render';
import { BindingFlags } from '../../observation';
import { bindable } from '../bindable';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean = false;

  public elseFactory: IViewFactory = null;

  public ifView: IView = null;
  public elseView: IView = null;
  public coordinator: CompositionCoordinator;

  constructor(
    public ifFactory: IViewFactory,
    public location: IRenderLocation) {
    this.coordinator = new CompositionCoordinator();
  }

  public binding(flags: BindingFlags): void {
    const view = this.updateView();
    this.coordinator.compose(view);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(): void {
    this.coordinator.attaching();
  }

  public detaching(): void {
    this.coordinator.detaching();
  }

  public unbinding(flags: BindingFlags): void {
    this.coordinator.unbinding(flags);
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

  public valueChanged(newValue: boolean, oldValue: boolean, flags: BindingFlags): void {
    if (flags & BindingFlags.fromFlushChanges) {
      const view = this.updateView();
      this.coordinator.compose(view);
    } else {
      Lifecycle.queueFlush(this);
    }
  }

  public flushChanges(): void {
    const view = this.updateView();
    this.coordinator.compose(view);
  }

  private updateView(): IView {
    let view: IView;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory);
    } else {
      view = null;
    }

    return view;
  }

  private ensureView(view: IView, factory: IViewFactory): IView {
    if (view === null) {
      view = factory.create();
    }

    view.hold(this.location);

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
