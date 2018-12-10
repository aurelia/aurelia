import { inject, IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.interfaces';
import { CompositionCoordinator, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation, CompositionCoordinator)
export class If {
  public static register: IRegistry['register'];

  @bindable public value: boolean;

  public elseFactory: IViewFactory | null;
  public elseView: IView | null;
  public ifFactory: IViewFactory;
  public ifView: IView | null;
  public location: IRenderLocation;
  public coordinator: CompositionCoordinator;

  constructor(ifFactory: IViewFactory, location: IRenderLocation, coordinator: CompositionCoordinator) {
    this.value = false;

    this.coordinator = coordinator;
    this.elseFactory = null;
    this.elseView = null;
    this.ifFactory = ifFactory;
    this.ifView = null;
    this.location = location;
  }

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
      this.$lifecycle.enqueueFlush(this).catch(error => { throw error; });
    }
  }

  public flush(flags: LifecycleFlags): void {
    const view = this.updateView(flags);
    this.coordinator.compose(view, flags);
  }

  /** @internal */
  public updateView(flags: LifecycleFlags): IView | null {
    let view: IView | null;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = null;
    }

    return view;
  }

  /** @internal */
  public ensureView(view: IView | null, factory: IViewFactory, flags: LifecycleFlags): IView {
    if (view === null) {
      view = factory.create();
    }

    view.hold(this.location, flags);

    return view;
  }
}

export interface Else extends ICustomAttribute {}

@templateController('else')
@inject(IViewFactory)
export class Else {
  public static register: IRegistry['register'];

  private factory: IViewFactory;

  constructor(factory: IViewFactory) {
    this.factory = factory;
  }

  public link(ifBehavior: If): void {
    ifBehavior.elseFactory = this.factory;
  }
}
