import { inject, IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute, templateController } from '../custom-attribute';

export interface Replaceable extends ICustomAttribute {}
@templateController('replaceable')
@inject(IViewFactory, IRenderLocation)
export class Replaceable {
  public static register: IRegistry['register'];

  private currentView: IView;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
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
