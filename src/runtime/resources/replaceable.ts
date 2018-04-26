import { IVisualFactory, IVisual } from '../templating/view-engine';
import { inject, templateController, customAttribute } from '../decorators';
import { IRenderSlot } from '../templating/render-slot';
import { IScope } from '../binding/binding-context';

@customAttribute('replaceable')
@templateController
@inject(IVisualFactory, IRenderSlot)
export class Replaceable {
  private child: IVisual;

  constructor(private factory: IVisualFactory, private slot: IRenderSlot) {
    this.child = this.factory.create();
    this.slot.add(this.child);
  }

  bound(scope: IScope) {
    this.child.$bind(scope);
  }

  unbound() {
    this.child.$unbind();
  }
}
