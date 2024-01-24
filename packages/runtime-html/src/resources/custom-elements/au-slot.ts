import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { bindable } from '../../bindable';
import { customElement } from '../custom-element';
import { IInstruction } from '../../renderer';
import { IHydrationContext } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { createInterface, registerResolver } from '../../utilities-di';
import { createMutationObserver } from '../../utilities-dom';

import { IContainer, InstanceProvider, Writable, emptyArray, onResolve, optional, resolve } from '@aurelia/kernel';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import type { IViewFactory } from '../../templating/view';
import type { HydrateElementInstruction } from '../../renderer';
import { type IAuSlot, type IAuSlotSubscriber, IAuSlotWatcher } from '../../templating/controller.projection';

@customElement({
  name: 'au-slot',
  template: null,
  containerless: true
})
export class AuSlot implements ICustomElementViewModel, IAuSlot {
  public readonly view: ISyntheticView;
  /** @internal */
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  /** @internal */ private readonly _location: IRenderLocation;
  /** @internal */ private _parentScope: Scope | null = null;
  /** @internal */ private _outerScope: Scope | null = null;
  /** @internal */ private readonly _hasProjection: boolean;
  /** @internal */ private readonly _hdrContext: IHydrationContext;
  /** @internal */ private readonly _slotwatchers: readonly IAuSlotWatcher[];
  /** @internal */ private readonly _hasSlotWatcher: boolean;
  /** @internal */ private _attached: boolean = false;

  /**
   * The binding context that will be exposed to slotted content
   */
  @bindable
  public expose: object | null = null;

  /**
   * A callback that will be called when the content of this slot changed
   */
  @bindable
  public slotchange: ((name: string, nodes: readonly Node[]) => void) | null = null;

  public constructor() {
    const hdrContext = resolve(IHydrationContext);
    const location = resolve(IRenderLocation);
    const instruction = resolve(IInstruction) as HydrateElementInstruction;
    const rendering = resolve(IRendering);
    const slotInfo = instruction.auSlot!;
    const projection = hdrContext.instruction?.projections?.[slotInfo.name];
    const contextController = hdrContext.controller;
    let factory: IViewFactory;
    let container: IContainer;
    let projectionContext: IProjectionContext | undefined;
    let projections: IProjectionContext[];

    this.name = slotInfo.name;
    if (projection == null) {
      container = contextController.container.createChild(inheritParentResourcesOptions);
      factory = rendering.getViewFactory(slotInfo.fallback, container);
      registerResolver(
        container,
        IProjectionContext,
        new InstanceProvider(void 0, noProjection)
      );
      this._hasProjection = false;
    } else {
      // projection could happen within a projection, example:
      // --my-app--
      // <s-1>
      //   ---projection 1---
      //   <s-2>
      //     ---projection 2---
      //     <s-3>
      // for the template above, if <s-3> is injecting <S1>,
      // we won't find the information in the hydration context hierarchy <MyApp>/<S3>
      // as it's a flat wysiwyg structure based on the template html
      //
      // since we are construction the projection (2) view based on the
      // container of <my-app>, we need to pre-register all information stored
      // in projection (1) into the container created for the projection (2) view
      //
      // but if <au-slot> inside <s-2> is not having a projection, or projection (2) doesn't exist
      // we also need to block inner projection hierarchy of <s-2> template from reaching projection 1
      // example inner template of <s-2>:
      // <s-2-1>
      //  ---projection 1.1---
      //    <s-2-2>
      //
      // without proper blocking, projection (1.1) may accidentally retrieve projection (1) information
      // blocking is done by registering a null projection context in an <au-slot> without projection
      //
      // BUT!!! Blocking doesn't matter, since all projection information is about the host CE
      // which is always available in the container of the <au-slot> without projection
      // In the first example template, <au-slot> within <s-2> will always be able to see <s-1>,
      // or <au-slot> within <s-3> will always be able to see <s-2>

      projectionContext = resolve(optional(IProjectionContext));
      container = hdrContext.parent!.controller.container.createChild(inheritParentResourcesOptions);
      projections = projectionContext != null ? resolveProjections(projectionContext) : [];
      projections.unshift(
        //
        // also need to build the current context
        //
        projectionContext = new ProjectionContext(contextController, projectionContext ?? null)
      );
      projections.forEach(p => {
        const controller = p._controller;
        registerResolver(
          container,
          controller.definition.Type,
          new InstanceProvider(void 0, controller.viewModel)
        );
      });
      registerResolver(
        container,
        IProjectionContext,
        new InstanceProvider(void 0, projectionContext)
      );
      registerResolver(
        container,
        contextController.definition.Type,
        new InstanceProvider(void 0, contextController.viewModel)
      );
      factory = rendering.getViewFactory(projection, container);
      this._hasProjection = true;
      this._slotwatchers = contextController.container.getAll(IAuSlotWatcher, false)?.filter(w => w.slotName === '*' || w.slotName === slotInfo.name) ?? emptyArray;
    }
    this._hasSlotWatcher = (this._slotwatchers ??= emptyArray).length > 0;
    this._hdrContext = hdrContext;
    this.view = factory.create().setLocation(this._location = location);
  }

  public readonly name: string;
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
  private readonly _subs = new Set<IAuSlotSubscriber>();

  public subscribe(subscriber: IAuSlotSubscriber): void {
    this._subs.add(subscriber);
  }

  public unsubscribe(subscriber: IAuSlotSubscriber): void {
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
        this._slotwatchers.forEach(w => w.watch(this));
        this._observe();
        this._notifySlotChange();
        this._attached = true;
      }
    });
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._attached = false;
    this._unobserve();
    this._slotwatchers.forEach(w => w.unwatch(this));
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
    (this._observer = createMutationObserver(parent, records => {
      if (isMutationWithinLocation(location, records)) {
        this._notifySlotChange();
      }
    })).observe(parent, { childList: true });
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
    let sub: IAuSlotSubscriber;
    if (this._attached) {
      this.slotchange?.call(void 0, this.name, nodes);
    }
    for (sub of subs) {
      sub.handleSlotChange(this, nodes);
    }
  }
}

const comparePosition = (a: Node, b: Node) => a.compareDocumentPosition(b);
const isMutationWithinLocation = (location: IRenderLocation, records: MutationRecord[]) => {
  for (const { addedNodes, removedNodes, nextSibling } of records) {
    let i = 0;
    // eslint-disable-next-line prefer-const
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
    if (removedNodes.length > 0) {
      if (nextSibling != null && comparePosition(location.$start!, nextSibling) === /* DOCUMENT_POSITION_FOLLOWING */4
        && comparePosition(location, nextSibling) === /* DOCUMENT_POSITION_PRECEDING */2
      ) {
        return true;
      }
    }
  }
};

interface IProjectionContext {
  _controller: ICustomElementController;
  _parent: IProjectionContext | null;
}

const IProjectionContext = createInterface<IProjectionContext>('IProjectionContext');

class ProjectionContext implements IProjectionContext {
  public constructor(
    public readonly _controller: ICustomElementController,
    public readonly _parent: IProjectionContext | null,
  ) {}
}

const noProjection = new ProjectionContext(null!, null);
const inheritParentResourcesOptions = { inheritParentResources: true };

const resolveProjections = (context: IProjectionContext) => {
  // walk up the context hierarchy and get all controllers
  const projections = [];
  let curr: IProjectionContext | null = context;
  while (curr != null && curr !== noProjection) {
    projections.push(curr);
    curr = curr._parent;
  }
  return projections;
};
