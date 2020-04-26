import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController } from '../../lifecycle';
import { bindable } from '../../templating/bindable';
import { templateController } from '../custom-attribute';

@templateController('if')
export class If<T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public elseFactory?: IViewFactory<T> = void 0;
  public elseView?: ISyntheticView<T> = void 0;
  public ifView?: ISyntheticView<T> = void 0;
  public view?: ISyntheticView<T> = void 0;

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public value: boolean = false;

  public constructor(
    @IViewFactory private readonly ifFactory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) {}

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const view = this.view = this.updateView(this.value, flags);
    if (view !== void 0) {
      const { $controller } = this;
      return view.activate(initiator, $controller, flags, $controller.scope, $controller.part);
    }
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.view !== void 0) {
      return this.view.deactivate(initiator, this.$controller, flags);
    }
  }

  public valueChanged(
    newValue: boolean,
    oldValue: boolean,
    flags: LifecycleFlags,
  ): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    let ret: void | Promise<void> = void 0;
    if (this.view !== void 0) {
      ret = this.view.deactivate(this.view, $controller, flags);
    }

    if (ret instanceof Promise) {
      // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ret.then(() => {
        const view = this.view = this.updateView(this.value, flags);
        if (view !== void 0) {
          return view.activate(view, $controller, flags, $controller.scope, $controller.part);
        }
      });
    } else {
      const view = this.view = this.updateView(this.value, flags);
      if (view !== void 0) {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        view.activate(view, $controller, flags, $controller.scope, $controller.part);
      }
    }
  }

  /** @internal */
  public updateView(
    value: boolean,
    flags: LifecycleFlags,
  ): ISyntheticView<T> | undefined {
    if (value) {
      return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    }

    if (this.elseFactory != void 0) {
      return this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    }

    return void 0;
  }

  /** @internal */
  public ensureView(
    view: ISyntheticView<T> | undefined,
    factory: IViewFactory<T>,
    flags: LifecycleFlags,
  ): ISyntheticView<T> {
    if (view === void 0) {
      view = factory.create(flags);
    }

    view.setLocation(this.location, MountStrategy.insertBefore);

    return view;
  }

  public dispose(): void {
    if (this.ifView !== void 0) {
      this.ifView.dispose();
      this.ifView = void 0;
    }

    if (this.elseView !== void 0) {
      this.elseView.dispose();
      this.elseView = void 0;
    }

    this.view = void 0;
  }
}

@templateController('else')
export class Else<T extends INode = INode> {
  public readonly id: number = nextId('au$component');

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
  ) {}

  public link(ifBehavior: If<T> | ICustomAttributeController<T>): void {
    if (ifBehavior instanceof If) {
      ifBehavior.elseFactory = this.factory;
    } else if (ifBehavior.viewModel instanceof If) {
      ifBehavior.viewModel.elseFactory = this.factory;
    } else {
      throw new Error(`Unsupported IfBehavior`); // TODO: create error code
    }
  }
}
