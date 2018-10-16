import { inject } from '@aurelia/kernel';
import { IChangeSet } from '../../binding';
import { BindingFlags } from '../../binding/binding-flags';
import { DOM, INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IChangeSet, IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean = false;

  public elseFactory: IViewFactory = null;

  public ifView: IView = null;
  public elseView: IView = null;
  public coordinator: CompositionCoordinator;

  constructor(
    public readonly changeSet: IChangeSet,
    public ifFactory: IViewFactory,
    public location: IRenderLocation) {
    this.coordinator = new CompositionCoordinator(this.changeSet);
  }

  public binding(flags: BindingFlags): void {
    const view = this.updateView();
    this.coordinator.compose(view);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    this.coordinator.attaching(encapsulationSource, lifecycle);
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    this.coordinator.detaching(lifecycle);
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
    if ((flags & BindingFlags.fromFlushChanges) > 0) {
      const view = this.updateView();
      this.coordinator.compose(view);
    } else {
      this.changeSet.add(this);
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

    view.mount(this.location);

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
