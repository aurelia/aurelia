import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { templateController } from '../custom-attribute';

@templateController('replaceable')
export class Replaceable<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public readonly view: ISyntheticView<T>;

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>
  ) {
    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
  }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$controller.scope, this.factory.name);
  }

  public beforeAttach(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public beforeDetach(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public beforeUnbind(flags: LifecycleFlags): ILifecycleTask {
    const task = this.view.unbind(flags);
    this.view.parent = void 0;
    return task;
  }
}
