import { inject, IRegistry } from '@aurelia/kernel';
import { Scope } from '../../binding/binding-context';
import { IRenderLocation } from '../../dom';
import { IView, IViewFactory, State } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { templateController } from '../custom-attribute';
import { ICustomAttribute } from '../lifecycle-render';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IRenderLocation)
export class With {
  public static register: IRegistry['register'];

  @bindable public value: any = null;

  private currentView: IView = null;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.currentView = this.factory.create();
    this.currentView.hold(location, LifecycleFlags.fromCreate);
  }

  public valueChanged(this: With): void {
    if (this.$state & State.isBound) {
      this.bindChild(LifecycleFlags.fromBindableHandler);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.bindChild(flags);
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

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(this.$scope, this.value);
    this.currentView.$bind(flags, scope);
  }
}
