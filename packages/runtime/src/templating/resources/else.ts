import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { templateController } from '../custom-attribute';
import { IRenderSlot } from '../render-slot';
import { IVisualFactory } from '../visual';
import { If } from './if';
import { IfCore } from './if-core';

@templateController('else')
@inject(IVisualFactory, IRenderSlot)
export class Else extends IfCore {
  private ifBehavior: If;

  public bound(scope: IScope) {
    if (this.ifBehavior.condition) {
      this.hide();
    } else {
      this.show();
    }
  }

  public link(ifBehavior: If) {
    if (this.ifBehavior === ifBehavior) {
      return this;
    }

    this.ifBehavior = ifBehavior;
    ifBehavior.link(this);

    return this;
  }
}
