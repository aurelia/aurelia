import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
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

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
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
