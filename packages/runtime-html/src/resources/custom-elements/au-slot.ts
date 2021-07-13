import { OverrideContext, Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { bindable } from '../../bindable.js';
import { customElement } from '../custom-element.js';
import { IInstruction } from '../../renderer.js';
import { IHydrationContext } from '../../templating/controller.js';
import { getRenderContext } from '../../templating/render-context.js';

import type { Writable } from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import type { IViewFactory } from '../../templating/view.js';
import type { HydrateElementInstruction } from '../../renderer.js';

export class AuSlot implements ICustomElementViewModel {
  /** @internal */
  public static get inject() { return [IRenderLocation, IInstruction, IHydrationContext]; }

  public readonly view: ISyntheticView;
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  private parentScope: Scope | null = null;
  private outerScope: Scope | null = null;
  private readonly hasProjection: boolean;

  @bindable
  public expose: object | undefined;

  public constructor(
    location: IRenderLocation,
    instruction: HydrateElementInstruction,
    private readonly hdrContext: IHydrationContext,
  ) {
    let factory: IViewFactory;
    const slotInfo = instruction.auSlot!;
    const projection = hdrContext.instruction?.projections?.[slotInfo.name];
    if (projection == null) {
      factory = getRenderContext(slotInfo.fallback, hdrContext.controller.container).getViewFactory();
      this.hasProjection = false;
    } else {
      factory = getRenderContext(projection, hdrContext.parent!.controller.container).getViewFactory();
      this.hasProjection = true;
    }
    this.view = factory.create().setLocation(location);
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    this.parentScope = this.$controller.scope.parentScope!;
    let outerScope: Scope;
    let overlayedOuterScope: Scope;
    if (this.hasProjection) {
      // if there is a projection,
      // then the au-slot should connect the outer scope with the inner scope binding context
      // via overlaying the outerscope with another scope that has
      // - binding context & override context pointing to the outer scope binding & override context respectively
      // - override context has the $host pointing to inner scope binding context
      outerScope = this.hdrContext.controller.scope.parentScope!;
      overlayedOuterScope = this.outerScope = Scope.create(
        outerScope.bindingContext,
        OverrideContext.create(outerScope.bindingContext),
        false
      );
      overlayedOuterScope.parentScope = outerScope;
      overlayedOuterScope.overrideContext.$host = this.expose ?? this.parentScope.bindingContext;
    }
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.activate(
      initiator,
      this.$controller,
      flags,
      this.hasProjection ? this.outerScope! : this.parentScope!,
    );
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public exposeChanged(v: object): void {
    if (this.hasProjection && this.outerScope != null) {
      this.outerScope.overrideContext.$host = v;
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

customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
