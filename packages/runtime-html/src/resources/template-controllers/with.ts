import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';
import { bindable } from '../../bindable';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, LifecycleFlags } from '../../templating/controller';

export class With implements ICustomAttributeViewModel {
  /** @internal */ protected static inject = [IViewFactory, IRenderLocation];

  public view: ISyntheticView;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public value?: object;

  public constructor(
    factory: IViewFactory,
    location: IRenderLocation
  ) {
    this.view = factory.create().setLocation(location);
  }

  public valueChanged(
    newValue: unknown,
    _oldValue: unknown,
    _flags: LifecycleFlags,
  ): void {
    const $controller = this.$controller;
    const bindings = this.view.bindings;
    let scope: Scope;
    let i = 0, ii = 0;
    if ($controller.isActive && bindings != null) {
      scope = Scope.fromParent($controller.scope, newValue === void 0 ? {} : newValue as object);
      for (ii = bindings.length; ii > i; ++i) {
        bindings[i].$bind(scope);
      }
    }
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller, value } = this;
    const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
    return this.view.activate(initiator, $controller, flags, scope);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

templateController('with')(With);
