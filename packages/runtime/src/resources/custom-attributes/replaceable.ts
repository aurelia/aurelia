import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { templateController } from '../custom-attribute';

@templateController('replaceable')
export class Replaceable<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public view: ISyntheticView<T>;

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>
  ) {
    this.view = this.factory.create();
    this.view.setLocation(location, MountStrategy.insertBefore);
  }

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags | LifecycleFlags.allowParentScopeTraversal, $controller.scope, this.factory.name);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public onCancel(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void {
    this.view?.cancel(initiator, this.$controller, flags);
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
