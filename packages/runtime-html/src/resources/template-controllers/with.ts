import { onResolve, optional, resolve } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { FragmentNodeSequence, IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, ISyntheticView } from '../../templating/controller';
import { IResumeContext } from '../../templating/hydration';

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
  /** @internal */ private _ssrContext: IResumeContext | undefined = resolve(optional(IResumeContext));
  private view!: ISyntheticView;

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
    if (this._ssrContext) {
      const ctx = this._ssrContext;
      this._ssrContext = void 0;
      return this._activateHydratedView(ctx);
    }
    return this._activateView();
  }

  /** @internal */
  private _activateView(): void | Promise<void> {
    const { $controller, value } = this;
    const view = this.view = this._factory.create().setLocation(this._location);
    const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
    return view.activate(view, $controller, scope);
  }

  /** @internal */
  private _activateHydratedView(context: IResumeContext): void | Promise<void> {
    const ctrl = this.$controller;
    const hasSsrView = context.manifest.views.length > 0;

    if (!hasSsrView) {
      // No view was rendered on server, create one now
      return this._activateView();
    }

    // Adopt the existing DOM
    const viewNodes = context.collectViewNodes(0);
    const viewFragment = document.createDocumentFragment();
    for (const node of viewNodes) {
      viewFragment.appendChild(node);
    }

    const platform = ctrl.container.get(IPlatform);
    const nodes = new FragmentNodeSequence(platform, viewFragment);
    const viewTargets = context.getViewTargets(0);
    const view = this.view = this._factory.adopt(nodes, viewTargets);
    view.setLocation(this._location);

    const { value } = this;
    const scope = Scope.fromParent(ctrl.scope, value === void 0 ? {} : value);
    return view.activate(view, ctrl, scope);
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
