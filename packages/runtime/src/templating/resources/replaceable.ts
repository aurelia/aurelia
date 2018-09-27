import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IView, IViewFactory } from '../view';

export interface Replaceable extends ICustomAttribute {}
@templateController('replaceable')
@inject(IViewFactory, IRenderLocation)
export class Replaceable {
  private currentView: IView;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.currentView = this.factory.create();
    this.currentView.mount(location);
  }

  public binding(flags: BindingFlags): void {
    this.currentView.$bind(flags, this.$scope);
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
}
