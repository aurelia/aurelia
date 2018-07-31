import { templateController, ICustomAttribute } from '../custom-attribute';
import { IRenderSlot } from '../render-slot';
import { BindingContext } from '../../binding/binding-context';
import { inject } from '@aurelia/kernel';
import { IVisualFactory, IVisual } from '../visual';
import { BindingFlags } from '../../binding/binding-flags';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IVisualFactory, IRenderSlot)
export class With { 
  private child: IVisual = null;

  public value: any = null;

  constructor(private factory: IVisualFactory, private slot: IRenderSlot) { 
    this.child = factory.create();
    this.slot.add(this.child);
  }

  public valueChanged(newValue: any) {
    const childScope = {
      bindingContext: newValue,
      overrideContext: BindingContext.createOverride(newValue, this.$scope.overrideContext)
    };

    this.child.$bind(BindingFlags.none, childScope);
  }

  public unbound() {
    this.child.$unbind(BindingFlags.none);
  }
}
