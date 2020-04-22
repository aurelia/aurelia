import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { templateController } from '../custom-attribute';

abstract class FlagsTemplateController<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number;

  public view: ISyntheticView<T>;

  public readonly $controller!: ICustomAttributeController<T, this>;

  public constructor(
    private readonly factory: IViewFactory<T>,
    location: IRenderLocation<T>,
    private readonly flags: LifecycleFlags,
  ) {
    this.id = nextId('au$component');

    this.view = this.factory.create();
    this.view.setLocation(location, MountStrategy.insertBefore);
  }

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LifecycleFlags,
  ): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(initiator, this.$controller, flags | this.flags, this.$controller.scope);
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
