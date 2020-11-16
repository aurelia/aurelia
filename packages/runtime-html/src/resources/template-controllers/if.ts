import { nextId, onResolve } from '@aurelia/kernel';
import { bindable, LifecycleFlags } from '@aurelia/runtime';
import { INode, IRenderLocation } from '../../dom.js';
import { Instruction } from '../../renderer.js';
import { ICompiledRenderContext } from '../../templating/render-context.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller.js';

@templateController('if')
export class If implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');

  public elseFactory?: IViewFactory = void 0;
  public elseView?: ISyntheticView = void 0;
  public ifView?: ISyntheticView = void 0;
  public view?: ISyntheticView = void 0;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public value: boolean = false;

  public constructor(
    @IViewFactory private readonly ifFactory: IViewFactory,
    @IRenderLocation private readonly location: IRenderLocation,
  ) {}

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const view = this.view = this.updateView(this.value, flags);
    if (view !== void 0) {
      const { $controller } = this;
      return view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope);
    }
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
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
    const ret = onResolve(
      this.view?.deactivate(this.view, $controller, flags),
      () => {
        const view = this.view = this.updateView(this.value, flags);
        if (view !== void 0) {
          // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
          return view.activate(view, $controller, flags, $controller.scope, $controller.hostScope);
        }
      },
    );
    if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
  }

  /** @internal */
  public updateView(
    value: boolean,
    flags: LifecycleFlags,
  ): ISyntheticView | undefined {
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
    view: ISyntheticView | undefined,
    factory: IViewFactory,
    flags: LifecycleFlags,
  ): ISyntheticView {
    if (view === void 0) {
      view = factory.create(flags);
    }

    view.setLocation(this.location);

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

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

@templateController({ name: 'else' })
export class Else {
  public readonly id: number = nextId('au$component');

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
  ) {}

  public link(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: Instruction,
  ): void {
    const children = controller.children!;
    const ifBehavior: If | ICustomAttributeController = children[children.length - 1] as If | ICustomAttributeController;
    if (ifBehavior instanceof If) {
      ifBehavior.elseFactory = this.factory;
    } else if (ifBehavior.viewModel instanceof If) {
      ifBehavior.viewModel.elseFactory = this.factory;
    } else {
      throw new Error(`Unsupported IfBehavior`); // TODO: create error code
    }
  }
}
