/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { onResolve } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';
import { bindable } from '../../bindable';

import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
import type { IInstruction } from '../../renderer';
import type { INode } from '../../dom';
import { createError } from '../../utilities';

export class If implements ICustomAttributeViewModel {
  /** @internal */ protected static inject = [IViewFactory, IRenderLocation];

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
  /** @internal */ private _wantsDeactivate: boolean = false;
  /** @internal */ private _swapId: number = 0;
  /** @internal */ private readonly _ifFactory: IViewFactory;
  /** @internal */ private readonly _location: IRenderLocation;

  public constructor(
    ifFactory: IViewFactory,
    location: IRenderLocation,
  ) {
    this._ifFactory = ifFactory;
    this._location = location;
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    let view: ISyntheticView | undefined;
    const ctrl = this.$controller;
    const swapId = this._swapId++;
    /**
     * returns true when
     * 1. entering deactivation of the [if] itself
     * 2. new swap has started since this change
     */
    const isCurrent = () => !this._wantsDeactivate && this._swapId === swapId + 1;
    return onResolve(this.pending, () => {
      if (!isCurrent()) {
        return;
      }
      this.pending = void 0;
      if (this.value) {
        view = (this.view = this.ifView = this.cache && this.ifView != null
          ? this.ifView
          : this._ifFactory.create()
        );
      } else {
        // truthy -> falsy
        view = (this.view = this.elseView = this.cache && this.elseView != null
          ? this.elseView
          : this.elseFactory?.create()
        );
      }
      if (view == null) {
        return;
      }
      // todo: else view should set else location
      view.setLocation(this._location);

      // Promise return values from user VM hooks are awaited by the initiator
      this.pending = onResolve(
        view.activate(initiator, ctrl, ctrl.scope),
        () => {
          if (isCurrent()) {
            this.pending = void 0;
          }
        });
      // old
      // void (this.view = this.updateView(this.value, f))?.activate(initiator, this.ctrl, f, this.ctrl.scope);
    });
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this._wantsDeactivate = true;
    return onResolve(this.pending, () => {
      this._wantsDeactivate = false;
      this.pending = void 0;
      // Promise return values from user VM hooks are awaited by the initiator
      void this.view?.deactivate(initiator, this.$controller, false);
    });
  }

  public valueChanged(newValue: unknown, oldValue: unknown): void | Promise<void> {
    if (!this.$controller.isActive) {
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
    const ctrl = this.$controller;
    const swapId = this._swapId++;
    /**
     * returns true when
     * 1. entering deactivation of the [if] itself
     * 2. new swap has started since this change
     */
    const isCurrent = () => !this._wantsDeactivate && this._swapId === swapId + 1;
    let view: ISyntheticView | undefined;
    return onResolve(this.pending,
      () => this.pending = onResolve(
        currView?.deactivate(currView, ctrl, false),
        () => {
          if (!isCurrent()) {
            return;
          }
          // falsy -> truthy
          if (newValue) {
            view = (this.view = this.ifView = this.cache && this.ifView != null
              ? this.ifView
              : this._ifFactory.create()
            );
          } else {
            // truthy -> falsy
            view = (this.view = this.elseView = this.cache && this.elseView != null
              ? this.elseView
              : this.elseFactory?.create()
            );
          }
          if (view == null) {
            return;
          }
          // todo: location should be based on either the [if]/[else] attribute
          //       instead of always the if
          view.setLocation(this._location);
          return onResolve(
            view.activate(view, ctrl, ctrl.scope),
            () => {
              if (isCurrent()) {
                this.pending = void 0;
              }
            }
          );
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
templateController('if')(If);

export class Else implements ICustomAttributeViewModel {
  /** @internal */ public static inject = [IViewFactory];

  /** @internal */ private readonly _factory: IViewFactory;

  public constructor(factory: IViewFactory) {
    this._factory = factory;
  }

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    const children = controller.children!;
    const ifBehavior: If | ICustomAttributeController = children[children.length - 1] as If | ICustomAttributeController;
    if (ifBehavior instanceof If) {
      ifBehavior.elseFactory = this._factory;
    } else if (ifBehavior.viewModel instanceof If) {
      ifBehavior.viewModel.elseFactory = this._factory;
    } else {
      if (__DEV__)
        throw createError(`AUR0810: Unsupported If behavior`);
      else
        throw createError(`AUR0810`);
    }
  }
}
templateController({ name: 'else' })(Else);
