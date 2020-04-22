import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController } from '../../lifecycle';
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

  public valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (this.$controller.isBound) {
      this.bindChild(this.$controller, LifecycleFlags.fromBind);
    }
  }

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void {
    this.view.parent = this.$controller;
    this.bindChild(initiator, flags);
  }

  public beforeAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void {
    this.view.attach(initiator, this.$controller, flags);
  }

  public beforeDetach(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void {
    this.view.detach(initiator, this.$controller, flags);
  }

  public beforeUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): void {
    this.view.unbind(initiator, this.$controller, flags);
    this.view.parent = void 0;
  }

  private bindChild(
    initiator: IHydratedController<T>,
    flags: LifecycleFlags,
  ): void {
    const scope = Scope.fromParent(flags, this.$controller.scope!, this.value === void 0 ? {} : this.value);
    this.view.bind(initiator, this.$controller, flags, scope, this.$controller.part);
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
  }
}
