import { resolve } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { adoptSSRView, isSSRTemplateController, type ISSRTemplateController } from '../../templating/ssr';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, ISyntheticView } from '../../templating/controller';

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
  /** @internal */ private readonly _platform = resolve(IPlatform);
  public view!: ISyntheticView;

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
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    const { $controller, value } = this;
    // SSR hydration: adopt existing DOM instead of creating new views.
    // _hydrateView clears ssrScope, so reactivation takes the normal path.
    const ssrScope = $controller.ssrScope;
    if (ssrScope != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'with') {
      return this._hydrateView(ssrScope);
    }

    const view = this.view = this._factory.create($controller).setLocation(this._location);
    const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
    return view.activate(view, $controller, scope);
  }

  /** @internal */
  private _hydrateView(ssrScope: ISSRTemplateController): void | Promise<void> {
    const { $controller, value, _factory, _location, _platform } = this;

    const result = adoptSSRView(ssrScope, _factory, $controller, _location, _platform);
    if (result == null) {
      $controller.ssrScope = undefined;
      const view = this.view = _factory.create($controller).setLocation(_location);
      const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
      return view.activate(view, $controller, scope);
    }

    this.view = result.view;
    $controller.ssrScope = undefined;
    const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
    return result.view.activate(result.view, $controller, scope);
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}
