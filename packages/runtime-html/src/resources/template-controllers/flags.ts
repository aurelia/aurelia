import { nextId } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller.js';

abstract class FlagsTemplateController implements ICustomAttributeViewModel {
  public readonly id: number;

  public view: ISyntheticView;

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor(
    private readonly factory: IViewFactory,
    location: IRenderLocation,
    private readonly flags: LifecycleFlags,
  ) {
    this.id = nextId('au$component');

    this.view = this.factory.create().setLocation(location);
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

export class FrequentMutations extends FlagsTemplateController {
  /**
   * @internal
   */
  public static inject = [IViewFactory, IRenderLocation];
  public constructor(factory: IViewFactory, location: IRenderLocation) {
    super(factory, location, LifecycleFlags.persistentTargetObserverQueue);
  }
}

export class ObserveShallow extends FlagsTemplateController {
  /**
   * @internal
   */
  public static inject = [IViewFactory, IRenderLocation];
  public constructor(factory: IViewFactory, location: IRenderLocation) {
    super(factory, location, LifecycleFlags.observeLeafPropertiesOnly);
  }
}

templateController('frequent-mutations')(FrequentMutations);
templateController('observe-shallow')(ObserveShallow);
