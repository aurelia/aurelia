import { IViewFactory, IVisual } from '../templating/view-engine';
import { inject, templateController, customAttribute } from '../decorators';
import { IViewSlot } from '../templating/view-slot';
import { IScope } from '../binding/binding-context';

@customAttribute('replaceable')
@templateController
@inject(IViewFactory, IViewSlot)
export class Replaceable {
  private child: IVisual;

  constructor(private factory: IViewFactory, private viewSlot: IViewSlot) {
    this.child = this.factory.create();
    this.viewSlot.add(this.child);
  }

  bound(scope: IScope) {
    this.child.bind(scope);
  }

  unbound() {
    this.child.unbind();
  }
}
