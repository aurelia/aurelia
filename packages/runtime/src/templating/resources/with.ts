import { inject } from '@aurelia/kernel';
import { BindingContext } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';
import { IViewSlot } from '../view-slot';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IViewSlot)
export class With {
  public value: any = null;

  private child: IView = null;

  constructor(private factory: IViewFactory, private slot: IViewSlot) {
    this.child = factory.create();
    this.slot.add(this.child);
  }

  public valueChanged(newValue: any): void {
    const childScope = {
      bindingContext: newValue,
      overrideContext: BindingContext.createOverride(newValue, this.$scope.overrideContext)
    };

    this.child.$bind(BindingFlags.none, childScope);
  }

  public unbound(): void {
    this.child.$unbind(BindingFlags.none);
  }
}
