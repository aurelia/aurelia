import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory, MountStrategy } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { templateController } from '../custom-attribute';

abstract class FlagsTemplateController<T extends INode = INode> {
  public readonly id: number;

  public readonly view: IController<T>;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller!: IController<T>;

  public constructor(
    private readonly factory: IViewFactory<T>,
    location: IRenderLocation<T>,
    private readonly flags: LifecycleFlags,
  ) {
    this.id = nextId('au$component');

    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    this.view.parent = this.$controller;
    return this.view.bind(flags | this.flags, this.$controller.scope);
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

@templateController('infrequent-mutations')
export class InfrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(
    @IViewFactory factory: IViewFactory<T>,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    super(factory, location, LifecycleFlags.noTargetObserverQueue);
  }
}

@templateController('frequent-mutations')
export class FrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(
    @IViewFactory factory: IViewFactory<T>,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    super(factory, location, LifecycleFlags.persistentTargetObserverQueue);
  }
}

@templateController('observe-shallow')
export class ObserveShallow<T extends INode = INode> extends FlagsTemplateController<T> {
  public constructor(
    @IViewFactory factory: IViewFactory<T>,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    super(factory, location, LifecycleFlags.observeLeafPropertiesOnly);
  }
}
