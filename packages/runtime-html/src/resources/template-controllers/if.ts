import { nextId, onResolve } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';

import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller.js';
import type { ICompiledRenderContext } from '../../templating/render-context.js';
import type { Instruction } from '../../renderer.js';
import type { INode } from '../../dom.js';

@templateController('if')
export class If implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');

  public elseFactory?: IViewFactory = void 0;
  public elseView?: ISyntheticView = void 0;
  public ifView?: ISyntheticView = void 0;
  public view?: ISyntheticView = void 0;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public value: unknown = false;
  /**
   * `false` to always dispose the existing `view` whenever the value of if changes to false
   */
  @bindable({
    set: v => v === '' || !!v && v !== 'false'
  })
  public cache: boolean = true;
  private pending: void | Promise<void> = void 0;
  private wantsDeactivate: boolean = false;
  private swapId: number = 0;
  private ctrl!: ICustomAttributeController<If>;

  public constructor(
    @IViewFactory private readonly ifFactory: IViewFactory,
    @IRenderLocation private readonly location: IRenderLocation,
  ) {}

  public created(): void {
    this.ctrl = this.$controller;
  }

  public attaching(initiator: IHydratedController, parent: IHydratedController, f: LifecycleFlags): void | Promise<void> {
    let view: ISyntheticView | undefined;
    const swapId = this.swapId++;
    /**
     * returns true when
     * 1. entering deactivation of the [if] itself
     * 2. new swap has started since this change
     */
    const isCurrent = () => !this.wantsDeactivate && this.swapId === swapId + 1;
    return onResolve(this.pending, () => {
      if (!isCurrent()) {
        return;
      }
      this.pending = void 0;
      if (this.value) {
        view = (this.view = this.ifView = this.cache && this.ifView != null
          ? this.ifView
          : this.ifFactory.create(f)
        );
      } else {
        // truthy -> falsy
        view = (this.view = this.elseView = this.cache && this.elseView != null
          ? this.elseView
          : this.elseFactory?.create(f)
        );
      }
      if (view == null) {
        return;
      }
      // todo: else view should set else location
      view.setLocation(this.location);
      // Promise return values from user VM hooks are awaited by the initiator
      this.pending = view.activate(initiator, this.ctrl, f, this.ctrl.scope, this.ctrl.hostScope);
      // void (this.view = this.updateView(this.value, f))?.activate(initiator, this.ctrl, f, this.ctrl.scope, this.ctrl.hostScope);
    });
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    this.wantsDeactivate = true;
    return onResolve(this.pending, () => {
      this.wantsDeactivate = false;
      this.pending = void 0;
      // Promise return values from user VM hooks are awaited by the initiator
      void this.view?.deactivate(initiator, this.ctrl, flags);
    });
  }

  public valueChanged(newValue: unknown, oldValue: unknown, f: LifecycleFlags): void | Promise<void> {
    if (!this.ctrl.isActive) {
      return;
    }
    // change scenarios:
    // truthy -> truthy (do nothing)
    // falsy -> falsy (do nothing)
    // truthy -> falsy (no cache = destroy)
    // falsy -> truthy (no view = create)
    newValue = !!newValue;
    oldValue = !!oldValue;
    if (newValue === oldValue) {
      return;
    }
    const currView = this.view;
    const swapId = this.swapId++;
    /**
     * returns true when
     * 1. entering deactivation of the [if] itself
     * 2. new swap has started since this change
     */
    const isCurrent = () => !this.wantsDeactivate && this.swapId === swapId + 1;
    let view: ISyntheticView | undefined;
    return onResolve( this.pending,
      () => this.pending = onResolve(
        currView?.deactivate(currView, this.ctrl, f),
        () => {
          if (!isCurrent()) {
            return;
          }
          // falsy -> truthy
          if (newValue) {
            view = (this.view = this.ifView = this.cache && this.ifView != null
              ? this.ifView
              : this.ifFactory.create(f)
            );
          } else {
            // truthy -> falsy
            view = (this.view = this.elseView = this.cache && this.elseView != null
              ? this.elseView
              : this.elseFactory?.create(f)
            );
          }
          if (view == null) {
            return;
          }
          // todo: location should be based on either the [if]/[else] attribute
          //       instead of always the if
          view.setLocation(this.location);
          return onResolve(
            view.activate(view, this.ctrl, f, this.ctrl.scope, this.ctrl.hostScope),
            () =>
              this.pending = isCurrent() ? void 0 : this.pending
          )
        }
      )
    );
  }

  public dispose(): void {
    this.ifView?.dispose();
    this.elseView?.dispose();
    this.ifView
      = this.elseView
      = this.view
      = void 0;
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
