import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { bindable } from '../../bindable';
import { customElement } from '../custom-element';
import { IInstruction } from '../../renderer';
import { IHydrationContext } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';

import { IContainer, InstanceProvider, Writable } from '@aurelia/kernel';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import type { IViewFactory } from '../../templating/view';
import type { HydrateElementInstruction } from '../../renderer';
import { registerResolver } from '../../utilities-di';

@customElement({
  name: 'au-slot',
  template: null,
  containerless: true
})
export class AuSlot implements ICustomElementViewModel {
  /** @internal */ public static get inject() { return [IRenderLocation, IInstruction, IHydrationContext, IRendering]; }

  public readonly view: ISyntheticView;
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  /** @internal */ private _parentScope: Scope | null = null;
  /** @internal */ private _outerScope: Scope | null = null;
  /** @internal */ private readonly _hasProjection: boolean;
  /** @internal */ private readonly _hdrContext: IHydrationContext;

  @bindable
  public expose: object | undefined;

  public constructor(
    location: IRenderLocation,
    instruction: HydrateElementInstruction,
    hdrContext: IHydrationContext,
    rendering: IRendering,
  ) {
    let factory: IViewFactory;
    let container: IContainer;
    const slotInfo = instruction.auSlot!;
    const projection = hdrContext.instruction?.projections?.[slotInfo.name];
    if (projection == null) {
      factory = rendering.getViewFactory(slotInfo.fallback, hdrContext.controller.container);
      this._hasProjection = false;
    } else {
      container = hdrContext.parent!.controller.container.createChild();
      registerResolver(
        container,
        hdrContext.controller.definition.Type,
        new InstanceProvider(void 0, hdrContext.controller.viewModel)
      );
      factory = rendering.getViewFactory(projection, container);
      this._hasProjection = true;
    }
    this._hdrContext = hdrContext;
    this.view = factory.create().setLocation(location);
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._parentScope = this.$controller.scope.parent!;
    let outerScope: Scope;
    if (this._hasProjection) {
      // if there is a projection,
      // then the au-slot should connect the outer scope with the inner scope binding context
      // via overlaying the outerscope with another scope that has
      // - binding context & override context pointing to the outer scope binding & override context respectively
      // - override context has the $host pointing to inner scope binding context
      outerScope = this._hdrContext.controller.scope.parent!;
      (this._outerScope = Scope.fromParent(outerScope, outerScope.bindingContext))
        .overrideContext.$host = this.expose ?? this._parentScope.bindingContext;
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    return this.view.activate(
      initiator,
      this.$controller,
      this._hasProjection ? this._outerScope! : this._parentScope!,
    );
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller);
  }

  public exposeChanged(v: object): void {
    if (this._hasProjection && this._outerScope != null) {
      this._outerScope.overrideContext.$host = v;
    }
  }

  public dispose(): void {
    this.view.dispose();
    (this as Writable<this>).view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

