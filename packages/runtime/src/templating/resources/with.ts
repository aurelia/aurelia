import { inject } from '@aurelia/kernel';
import { Scope } from '../../binding/binding-context';
import { IRenderLocation } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle, LifecycleState } from '../../lifecycle';
import { BindingFlags } from '../../observation';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IRenderLocation)
export class With {
  @bindable public value: any = null;

  private currentView: IView = null;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public valueChanged(this: With): void {
    if (this.$state & LifecycleState.isBound) {
      this.bindChild(BindingFlags.fromBindableHandler);
    }
  }

  public binding(flags: BindingFlags): void {
    this.bindChild(flags);
  }

  public attaching(encapsulationSource: any, lifecycle: IAttachLifecycle): void {
    this.currentView.$attach(encapsulationSource, lifecycle);
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    this.currentView.$detach(lifecycle);
  }

  public unbinding(flags: BindingFlags): void {
    this.currentView.$unbind(flags);
  }

  private bindChild(flags: BindingFlags): void {
    this.currentView.$bind(
      flags,
      Scope.fromParent(this.$scope, this.value)
    );
  }
}
