import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { templateController } from '../custom-attribute';

abstract class FlagsTemplateController<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number;

  public readonly view: ISyntheticView<T>;

  public readonly $controller!: ICustomAttributeController<T, this>;

  public constructor(
    private readonly factory: IViewFactory<T>,
    location: IRenderLocation<T>,
    private readonly flags: LifecycleFlags,
  ) {
    this.id = nextId('au$component');

    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
  }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(flags | this.flags, this.$controller.scope);
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

@templateController('infrequent-mutations')
export class InfrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(@IViewFactory factory: IViewFactory<T>, @IRenderLocation location: IRenderLocation<T>) {
    super(factory, location, LifecycleFlags.noTargetObserverQueue);
  }
}

@templateController('frequent-mutations')
export class FrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(@IViewFactory factory: IViewFactory<T>, @IRenderLocation location: IRenderLocation<T>) {
    super(factory, location, LifecycleFlags.persistentTargetObserverQueue);
  }
}

@templateController('observe-shallow')
export class ObserveShallow<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(@IViewFactory factory: IViewFactory<T>, @IRenderLocation location: IRenderLocation<T>) {
    super(factory, location, LifecycleFlags.observeLeafPropertiesOnly);
  }
}
