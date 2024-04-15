/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { onResolve, resolve } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';

import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
import type { IInstruction } from '../../renderer';
import type { INode } from '../../dom';
import { ErrorNames, createMappedError } from '../../errors';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';

export class If implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'if',
    isTemplateController: true,
    bindables: {
      value: true,
      cache: {
        set: v => v === '' || !!v && v !== 'false',
      }
    }
  };

  public elseFactory?: IViewFactory = void 0;
  public elseView?: ISyntheticView = void 0;
  public ifView?: ISyntheticView = void 0;
  public view?: ISyntheticView = void 0;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value: unknown = false;
  /**
   * `false` to always dispose the existing `view` whenever the value of if changes to false
   */
  public cache: boolean = true;
  private pending: void | Promise<void> = void 0;
  /** @internal */ private _wantsDeactivate: boolean = false;
  /** @internal */ private _swapId: number = 0;
  /** @internal */ private readonly _ifFactory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);

  public attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    return this._swap(this.value);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this._wantsDeactivate = true;
    return onResolve(this.pending, () => {
      this._wantsDeactivate = false;
      this.pending = void 0;
      // Promise return values from user VM hooks are awaited by the initiator
      void this.view?.deactivate(initiator, this.$controller);
    });
  }

  public valueChanged(newValue: unknown, oldValue: unknown): void | Promise<void> {
    if (!this.$controller.isActive) return;

    newValue = !!newValue;
    oldValue = !!oldValue;
    if (newValue !== oldValue) return this._swap(newValue);
  }

  private _swap(value: unknown): void | Promise<void> {
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
        currView?.deactivate(currView, ctrl),
        () => {
          if (!isCurrent()) {
            return;
          }
          // falsy -> truthy
          if (value) {
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
          // if the value is falsy
          // and there's no [else], `view` will be null
          if (view == null) {
            return;
          }
          // todo: location should be based on either the [if]/[else] attribute
          //       instead of always of the [if]
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

export class Else implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'else',
    isTemplateController: true,
  };

  /** @internal */ private readonly _factory = resolve(IViewFactory);

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
      throw createMappedError(ErrorNames.else_without_if);
    }
  }
}
