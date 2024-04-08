import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { bindable } from '../../bindable';
import { CustomElementDefinition } from '../custom-element';
import { IInstruction } from '../../renderer';
import { IHydrationContext } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { registerResolver } from '../../utilities-di';
import { createMutationObserver, isElement } from '../../utilities-dom';

import { IContainer, InstanceProvider, Writable, emptyArray, onResolve, resolve } from '@aurelia/kernel';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import type { IViewFactory } from '../../templating/view';
import type { HydrateElementInstruction } from '../../renderer';
import { type IAuSlot, type IAuSlotSubscriber, IAuSlotWatcher, defaultSlotName, auslotAttr } from '../../templating/controller.projection';
import { IPlatform } from '../../platform';

let emptyTemplate: CustomElementDefinition;

export class AuSlot implements ICustomElementViewModel, IAuSlot {
  public static readonly $au = {
    type: 'custom-element',
    name: 'au-slot',
    template: null,
    containerless: true,
    processContent(el: HTMLElement, p: IPlatform, data: Record<string, unknown>) {
      data.name = el.getAttribute('name') ?? defaultSlotName;

      let node: Node | null = el.firstChild;
      let next: Node | null = null;
      while (node !== null) {
        next = node.nextSibling;
        if (isElement(node) && node.hasAttribute(auslotAttr)) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(
              `[DEV:aurelia] detected [au-slot] attribute on a child node`,
              `of an <au-slot> element: "<${node.nodeName} au-slot>".`,
              `This element will be ignored and removed`
            );
          }
          el.removeChild(node);
        }
        node = next;
      }
    },
  };

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
    const instruction = resolve(IInstruction) as HydrateElementInstruction<{ name: string}>;
    const rendering = resolve(IRendering);
    const slotName = this.name = instruction.data.name;
    // when <au-slot> is empty, there's not even projections
    // hence ?. operator is used
    // for fallback, there's only default slot used
    const fallback = instruction.projections?.[defaultSlotName];
    const projection = hdrContext.instruction?.projections?.[slotName];
    const contextContainer = hdrContext.controller.container;
    let factory: IViewFactory;
    let container: IContainer;

    if (projection == null) {
      container = contextContainer.createChild({ inheritParentResources: true });
      factory = rendering.getViewFactory(fallback ?? (emptyTemplate ??= CustomElementDefinition.create({
        name: 'au-slot-empty-template',
        template: '',
        needsCompile: false,
      })), container);
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
      // =============================

      // my-app template:
      // my-app  --- hydration context
      // <el>     --- owning element (this has this <au-slot> that uses ---projection)
      //   <s-1>  --- projection
      //
      container = contextContainer.createChild();
      // registering resources from the parent hydration context is necessary
      // as that's where the projection is declared in the template
      //
      // if neccessary, we can do the same gymnastic of registering information related to
      // a custom element registration like in renderer.ts from line 1088 to 1098
      // so we don't accidentally get information related to owning element (host, controller, instruction etc...)
      // although it may be more desirable to have owning element information available here
      container.useResources(hdrContext.parent!.controller.container);
      // doing this to shadow the owning element hydration context
      // since we created a container out of the owning element container
      // instead of the hydration context container
      registerResolver(container, IHydrationContext, new InstanceProvider(void 0, hdrContext.parent));
      factory = rendering.getViewFactory(projection, container);
      this._hasProjection = true;
      this._slotwatchers = contextContainer.getAll(IAuSlotWatcher, false)?.filter(w => w.slotName === '*' || w.slotName === slotName) ?? emptyArray;
    }
    this._hasSlotWatcher = (this._slotwatchers ??= emptyArray).length > 0;
    this._hdrContext = hdrContext;
    this.view = factory.create().setLocation(this._location = location);
  }

  // all the following properties (name, nodes, _subs, subscribe & unsubscribe) are relevant to the slot watcher feature
  // so grouping them here for better readability

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
