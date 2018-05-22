import { customAttribute, templateController } from '../decorators';
import { IRenderSlot } from '../templating/render-slot';
import { IScope, BindingContext } from '../binding/binding-context';
import { inject } from '../di';
import { IVisualFactory, IVisual } from '../templating/visual';

@customAttribute('with')
@templateController
@inject(IVisualFactory, IRenderSlot)
export class With { 
  //#region Framework-Supplied
  private $scope: IScope;
  //#endregion

  private child: IVisual = null;

  value: any = null;

  constructor(private factory: IVisualFactory, private slot: IRenderSlot) { 
    this.child = factory.create();
    this.slot.add(this.child);
  }

  valueChanged(newValue: any) {
    const childScope = {
      bindingContext: newValue,
      overrideContext: BindingContext.createOverride(newValue, this.$scope.overrideContext)
    };

    this.child.$bind(childScope);
  }

  unbound() {
    this.child.$unbind();
  }
}
