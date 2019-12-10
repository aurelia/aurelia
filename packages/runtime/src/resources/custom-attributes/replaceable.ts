import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory, MountStrategy } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { templateController } from '../custom-attribute';

@templateController('replaceable')
export class Replaceable<T extends INode = INode> {
  public readonly id: number = nextId('au$component');

  public readonly view: IController<T>;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller!: IController<T>; // This is set by the controller after this instance is constructed

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>
  ) {
    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$controller.scope, this.factory.name);
  }

  public attaching(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    const task = this.view.unbind(flags);
    this.view.parent = void 0;
    return task;
  }
}
