import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
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

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(initiator, this.$controller, flags | LifecycleFlags.allowParentScopeTraversal, this.$controller.scope, this.factory.name);
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
  ): ILifecycleTask {
    const task = this.view.unbind(initiator, this.$controller, flags);
    this.view.parent = void 0;
    return task;
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
  }
}
