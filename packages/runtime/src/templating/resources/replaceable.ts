import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { templateController } from '../custom-attribute';
import { IRenderSlot } from '../render-slot';
import { IVisual, IVisualFactory } from '../visual';

@templateController('replaceable')
@inject(IVisualFactory, IRenderSlot)
export class Replaceable {
  private child: IVisual;

  constructor(private factory: IVisualFactory, private slot: IRenderSlot) {
    this.child = this.factory.create();
    this.slot.add(this.child);
  }

  public bound(scope: IScope) {
    this.child.$bind(BindingFlags.none, scope);
  }

  public unbound() {
    this.child.$unbind(BindingFlags.none);
  }
}
