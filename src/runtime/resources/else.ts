import { IfCore } from './if-core';
import { If } from './if';
import { IVisualFactory } from '../templating/view-engine';
import { IRenderSlot } from '../templating/render-slot';
import { templateController, customAttribute } from '../decorators';
import { IScope } from '../binding/binding-context';
import { inject } from '../di';

@customAttribute('else')
@templateController
@inject(IVisualFactory, IRenderSlot)
export class Else extends IfCore {
  private ifBehavior: If;

  bound(scope: IScope) {
    if (this.ifBehavior.condition) {
      this.hide();
    } else {
      this.show();
    }
  }

  link(ifBehavior: If) {
    if (this.ifBehavior === ifBehavior) {
      return this;
    }

    this.ifBehavior = ifBehavior;
    ifBehavior.link(this);

    return this;
  }
}
