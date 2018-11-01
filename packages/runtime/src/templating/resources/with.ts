import { inject } from '@aurelia/kernel';
import { Scope } from '../../binding/binding-context';
import { templateController } from '../../custom-attribute';
import { IRenderLocation } from '../../dom';
import { State } from '../../lifecycle';
import { ICustomAttribute } from '../../lifecycle-render';
import { BindingFlags } from '../../observation';
import { bindable } from '../bindable';
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
    if (this.$state & State.isBound) {
      this.bindChild(BindingFlags.fromBindableHandler);
    }
  }

  public binding(flags: BindingFlags): void {
    this.bindChild(flags);
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

  private bindChild(flags: BindingFlags): void {
    this.currentView.$bind(
      flags,
      Scope.fromParent(this.$scope, this.value)
    );
  }
}
