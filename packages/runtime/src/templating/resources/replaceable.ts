import { templateController } from '../custom-attribute';
import { IRenderSlot } from '../render-slot';
import { IScope } from '../../binding/binding-context';
import { inject } from '@aurelia/kernel';
import { IVisualFactory, IVisual } from '../visual';
import { BindingFlags } from '../../binding/binding-flags';

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
