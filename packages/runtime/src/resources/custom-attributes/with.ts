import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { templateController } from '../custom-attribute';
import { bindable } from '../../templating/bindable';
import { Scope } from '../../observation/binding-context';

@templateController('with')
export class With<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public view: ISyntheticView<T>;

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public value?: object;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>
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
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.activateView(initiator, flags);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  private activateView(
    initiator: IHydratedController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller, value } = this;
    const scope = Scope.fromParent(flags, $controller.scope, value === void 0 ? {} : value);
    return this.view.activate(initiator, $controller, flags, scope, $controller.part);
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}
