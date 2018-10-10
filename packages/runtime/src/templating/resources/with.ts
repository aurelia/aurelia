import { inject } from '@aurelia/kernel';
import { BindingContext, IScope, Scope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IView, IViewFactory } from '../view';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IRenderLocation)
export class With {
  @bindable public value: any = null;

  private currentView: IView = null;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.currentView = this.factory.create();
    this.currentView.mount(location);
  }

  public valueChanged(): void {
    this.bindChild(BindingFlags.fromBindableHandler);
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
