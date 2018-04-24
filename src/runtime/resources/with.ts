import { customAttribute, templateController, inject } from "../decorators";
import { IViewFactory, IVisual } from "../templating/view-engine";
import { IViewSlot } from "../templating/view-slot";
import { IScope, BindingContext } from "../binding/binding-context";

@customAttribute('with')
@templateController
@inject(IViewFactory, IViewSlot)
export class With { 
  //#region Framework-Supplied
  private $scope: IScope;
  //#endregion

  private child: IVisual = null;

  value: any = null;

  constructor(private factory: IViewFactory, private viewSlot: IViewSlot) { 
    this.child = factory.create();
    this.viewSlot.add(this.child);
  }

  valueChanged(newValue: any) {
    const childScope = {
      bindingContext: newValue,
      overrideContext: BindingContext.createOverride(newValue, this.$scope.overrideContext)
    };

    this.child.bind(childScope);
  }

  unbound() {
    this.child.unbind();
  }
}
