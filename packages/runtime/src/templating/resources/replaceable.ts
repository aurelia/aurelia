import { inject, IRegistry } from '@aurelia/kernel';
import { INsRenderLocation } from '../../ns-dom';
import { IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute, templateController } from '../custom-attribute';

export interface Replaceable extends ICustomAttribute {}
@templateController('replaceable')
@inject(IViewFactory, INsRenderLocation)
export class Replaceable {
  public static register: IRegistry['register'];

  private currentView: IView;
  private factory: IViewFactory;

  constructor(factory: IViewFactory, location: INsRenderLocation) {
    this.factory = factory;

    this.currentView = this.factory.create();
    this.currentView.hold(location, LifecycleFlags.fromCreate);
  }

  public binding(flags: LifecycleFlags): void {
    this.currentView.$bind(flags, this.$scope);
  }

  public attaching(flags: LifecycleFlags): void {
    this.currentView.$attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.currentView.$detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.currentView.$unbind(flags);
  }
}
