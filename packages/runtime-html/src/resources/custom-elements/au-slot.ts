import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { bindable } from '../../bindable';
import { customElement } from '../custom-element';
import { IInstruction } from '../../renderer';
import { IHydrationContext } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';

import { IContainer, InstanceProvider, Writable, onResolve } from '@aurelia/kernel';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import type { IViewFactory } from '../../templating/view';
import type { HydrateElementInstruction } from '../../renderer';
import { optionalOwn, registerResolver } from '../../utilities-di';
import { ISlot, ISlotSubscriber, ISlotWatcher } from '../../templating/controller.projection';

@customElement({
  name: 'au-slot',
  template: null,
  containerless: true
})
export class AuSlot implements ICustomElementViewModel, ISlot {
  /** @internal */ public static get inject() { return [IRenderLocation, IInstruction, IHydrationContext, IRendering]; }

  public readonly view: ISyntheticView;
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  /** @internal */ private readonly _location: IRenderLocation;
  /** @internal */ private _parentScope: Scope | null = null;
  /** @internal */ private _outerScope: Scope | null = null;
  /** @internal */ private readonly _hasProjection: boolean;
  /** @internal */ private readonly _hdrContext: IHydrationContext;
  /** @internal */ private readonly _slotwatcher: ISlotWatcher | null;
  /** @internal */ private readonly _hasSlotWatcher: boolean;

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
    this.name = slotInfo.name;
    if (projection == null) {
      factory = rendering.getViewFactory(slotInfo.fallback, hdrContext.controller.container);
      this._hasProjection = false;
      this._slotwatcher = null;
    } else {
      container = hdrContext.parent!.controller.container.createChild();
      registerResolver(
        container,
        hdrContext.controller.definition.Type,
        new InstanceProvider(void 0, hdrContext.controller.viewModel)
      );
      factory = rendering.getViewFactory(projection, container);
      this._hasProjection = true;
      this._slotwatcher = hdrContext.controller.container.get(optionalOwn(ISlotWatcher)) ?? null;
    }
    this._hasSlotWatcher = this._slotwatcher != null;
    this._hdrContext = hdrContext;
    this.view = factory.create().setLocation(this._location = location);
  }

  public name: string;
  public get nodes() {
    const nodes = [];
    const location = this._location;
    let curr = location.$start!.nextSibling;
    while (curr != null && curr !== location) {
      if (curr.nodeType !== /* comment */8) {
        nodes.push(curr);
      }
      curr = curr.nextSibling;
    }
    return nodes;
  }

  /** @internal */
  private readonly _subs = new Set<ISlotSubscriber>();

  public subscribe(subscriber: ISlotSubscriber): void {
    if (!this._subs.has(subscriber) && this._subs.add(subscriber).size === 1) {
      /* empty */
    }
  }

  public unsubscribe(subscriber: ISlotSubscriber): void {
    this._subs.delete(subscriber);
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
    return onResolve(this.view.activate(
      initiator,
      this.$controller,
      this._hasProjection ? this._outerScope! : this._parentScope!,
      ), () => {
        if (this._hasSlotWatcher) {
          this._slotwatcher!.watch(this);
          this._observe();
          this._notifySlotChange();
        }
    });
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._unobserve();
    this._slotwatcher?.unwatch(this);
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

  /** @internal */
  private _observer: MutationObserver | null = null;
  /** @internal */
  private _observe(): void {
    if (this._observer != null) {
      return;
    }
    const location = this._location;
    const parent = location.parentElement;
    if (parent == null) {
      return;
    }
    this._observer = new parent.ownerDocument.defaultView!.MutationObserver(records => {
      if (isMutationWithinLocation(location, records)) {
        this._notifySlotChange();
      }
    });
  }

  /** @internal */
  private _unobserve(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  /** @internal */
  private _notifySlotChange() {
    const nodes = this.nodes;
    const subs = new Set(this._subs);
    for (const sub of subs) {
      sub.handleSlotChange(this, nodes);
    }
  }
}

const comparePosition = (a: Node, b: Node) => a.compareDocumentPosition(b);
const isMutationWithinLocation = (location: IRenderLocation, records: MutationRecord[]) => {
  for (const { addedNodes, removedNodes } of records) {
    let i = 0;
    let ii = addedNodes.length;
    let node: Node;
    for (; i < ii; ++i) {
      node = addedNodes[i];
      if (comparePosition(location.$start!, node) === /* DOCUMENT_POSITION_FOLLOWING */4
        && comparePosition(location, node) === /* DOCUMENT_POSITION_PRECEDING */2
      ) {
        return true;
      }
    }
    i = 0;
    ii = removedNodes.length;
    for (; i < ii; ++i) {
      node = removedNodes[i];
      if (comparePosition(location.$start!, node) === /* DOCUMENT_POSITION_FOLLOWING */4
        && comparePosition(location, node) === /* DOCUMENT_POSITION_PRECEDING */2
      ) {
        return true;
      }
    }
  }
};
