import { inject } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { ILifecycle } from '../../lifecycle';
import { BindingFlags } from '../../observation';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface Replaceable extends ICustomAttribute {}
@templateController('replaceable')
@inject(IViewFactory, IRenderLocation)
export class Replaceable {
  private currentView: IView;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public binding(flags: BindingFlags): void {
    this.currentView.$bind(flags, this.$scope);
  }

  public attaching(encapsulationSource: any, lifecycle: ILifecycle): void {
    this.currentView.$attach(encapsulationSource, lifecycle);
  }

  public detaching(lifecycle: ILifecycle): void {
    this.currentView.$detach(lifecycle);
  }

  public unbinding(flags: BindingFlags): void {
    this.currentView.$unbind(flags);
  }
}
