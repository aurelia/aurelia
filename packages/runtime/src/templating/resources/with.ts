import { inject, IRegistry } from '../../../kernel';
import { Scope } from '../../binding/binding-context';
// import { IRenderLocation } from '../../dom';
import { IView, IViewFactory, State } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IFabricRenderLocation } from '../../three-dom';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IFabricRenderLocation)
export class With {
  public static register: IRegistry['register'];

  @bindable public value: any = null;

  private currentView: IView = null;

  constructor(private factory: IViewFactory, location: IFabricRenderLocation) {
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
