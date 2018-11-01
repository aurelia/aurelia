import { inject } from '@aurelia/kernel';
import { templateController } from '../../custom-attribute';
import { IRenderLocation } from '../../dom';
import { ICustomAttribute } from '../../lifecycle-render';
import { BindingFlags } from '../../observation';
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

  public attaching(): void {
    this.currentView.$attach();
  }

  public detaching(): void {
    this.currentView.$detach();
  }

  public unbinding(flags: BindingFlags): void {
    this.currentView.$unbind(flags);
  }
}
