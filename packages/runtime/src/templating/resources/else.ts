import { inject } from '@aurelia/kernel';
import { IScope } from '../../binding/binding-context';
import { templateController } from '../custom-attribute';
import { IViewFactory } from '../view';
import { IViewSlot } from '../view-slot';
import { If } from './if';
import { IfCore } from './if-core';

@templateController('else')
@inject(IViewFactory, IViewSlot)
export class Else extends IfCore {
  private ifBehavior: If;

  public bound(scope: IScope): void {
    if (this.ifBehavior.condition) {
      this.hide();
    } else {
      this.show();
    }
  }

  public link(ifBehavior: If): this {
    if (this.ifBehavior === ifBehavior) {
      return this;
    }

    this.ifBehavior = ifBehavior;
    ifBehavior.link(this);

    return this;
  }
}
