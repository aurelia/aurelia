import { IViewFactory, IVisual } from '../templating/view-engine';
import { inject, templateController, customAttribute } from '../decorators';
import { IViewSlot } from '../templating/view-slot';
import { IScope } from '../binding/binding-context';

@customAttribute('replaceable')
@templateController
@inject(IViewFactory, IViewSlot)
export class Replaceable {
  private visual: IVisual;

  constructor(private viewFactory: IViewFactory, private viewSlot: IViewSlot) {
    this.visual = this.viewFactory.create();
    this.viewSlot.add(this.visual);
  }

  bound(scope: IScope) {
    this.visual.bind(scope);
  }

  unbound() {
    this.visual.unbind();
  }
}
