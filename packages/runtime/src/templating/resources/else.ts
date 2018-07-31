import { IfCore } from './if-core';
import { If } from './if';
import { IVisualFactory } from '../visual';
import { IRenderSlot } from '../render-slot';
import { templateController } from '../custom-attribute';
import { IScope } from '../../binding/binding-context';
import { inject } from '@aurelia/kernel';

@templateController('else')
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
