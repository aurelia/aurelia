import { optional, resolve } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
import { IHydrationManifest, type IControllerManifest } from '../../templating/hydration';

export class With implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'with',
    isTemplateController: true,
    bindables: ['value'],
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value?: object;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _hydrationManifest: IHydrationManifest | null;
  /** @internal */ private readonly _controllerManifest: IControllerManifest | null;

  // TODO: SSR hydration - adopt existing DOM using _factory.adopt() when _controllerManifest present
  private view = this._factory.create().setLocation(this._location);

  public constructor() {
    const manifest = this._hydrationManifest = resolve(optional(IHydrationManifest)) ?? null;
    const targetIndex = (this._location as IRenderLocation).$targetIndex;
    this._controllerManifest = manifest != null && targetIndex != null
      ? manifest.controllers[targetIndex] ?? null
      : null;
  }

  public valueChanged(
    newValue: unknown,
    _oldValue: unknown,
  ): void {
    const $controller = this.$controller;
    const bindings = this.view.bindings;
    let scope: Scope;
    let i = 0, ii = 0;
    if ($controller.isActive && bindings != null) {
      scope = Scope.fromParent($controller.scope, newValue === void 0 ? {} : newValue as object);
      for (ii = bindings.length; ii > i; ++i) {
        bindings[i].bind(scope);
      }
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    const { $controller, value } = this;
    const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
    return this.view.activate(initiator, $controller, scope);
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller);
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
