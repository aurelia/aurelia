import { nextId } from '@aurelia/kernel';
import { bindable, LifecycleFlags, Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { ISyntheticView, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';

@templateController('with')
export class With implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');

  public view: ISyntheticView;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public value?: object;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation private readonly location: IRenderLocation
  ) {
    this.id = nextId('au$component');

    this.view = this.factory.create();
    this.view.setLocation(location, MountStrategy.insertBefore);
  }

  public valueChanged(
    newValue: unknown,
    oldValue: unknown,
    flags: LifecycleFlags,
  ): void {
    if (this.$controller.isActive) {
      // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.activateView(this.view, LifecycleFlags.fromBind);
    }
  }

  public afterAttach(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.activateView(initiator, flags);
  }

  public afterUnbind(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  private activateView(
    initiator: IHydratedController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller, value } = this;
    const scope = Scope.fromParent(flags, $controller.scope, value === void 0 ? {} : value);
    return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
  }

  public onCancel(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void {
    this.view?.cancel(initiator, this.$controller, flags);
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
