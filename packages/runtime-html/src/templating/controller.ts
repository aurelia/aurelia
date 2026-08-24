/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  AnyFunction,
  IIndexable,
  ILogger,
  InstanceProvider,
  LogLevel,
  noop,
  optional,
  optionalResource,
  isFunction,
  isPromise,
  isString,
} from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior, AccessScopeExpression, createAccessScopeExpression } from '@aurelia/expression-parser';
import {
  ICoercionConfiguration,
  IObserverLocator,
  queueTask,
  Scope,
} from '@aurelia/runtime';
import { convertToRenderLocation } from '../dom';
import { refs } from '../dom.node';
import { CustomAttributeDefinition, getAttributeDefinition } from '../resources/custom-attribute';
import { CustomElementDefinition, elementBaseName, getElementDefinition, isElementType } from '../resources/custom-element';
import { etIsProperty, getOwnPropertyNames, objectFreeze } from '../utilities';
import { createInterface, registerResolver } from '../utilities-di';
import { LifecycleHooks, LifecycleHooksEntry } from './lifecycle-hooks';
import {
  createLifecycleDeferred,
  getActiveLifecycleOperation,
  getLifecyclePromiseOrder,
  getOperationError,
  isLifecycleOperationJoinedInto,
  invokeControllerPhase,
  LifecycleSelfAwaitError,
  OrderedLifecycleFailure,
  recordStepError,
  reserveLifecycleParticipant,
  type ControllerStep,
  type InvocableLifecyclePhase,
  type LifecycleErrorRecord,
  type LifecycleOperationKind,
  type LifecycleOperation,
  type TransitionRequest,
} from './lifecycle-operation';
import { IRendering } from './rendering';
import { IShadowDOMGlobalStyles, IShadowDOMStyles } from './styles';
import { ComputedWatcher, ExpressionWatcher } from './watchers';

import type {
  Constructable,
  IContainer,
  IDisposable,
  IServiceLocator,
  ResourceDefinition,
  Writable,
} from '@aurelia/kernel';
import type {
  IObservable,
} from '@aurelia/runtime';
import type { INodeSequence, IRenderLocation } from '../dom';
import type { INode } from '../dom.node';
import { ErrorNames, createMappedError } from '../errors';
import type { ISSRScope, ISSRScopeChild, ISSRTemplateController } from './ssr';
import type { IInstruction, AttrSyntax } from '@aurelia/template-compiler';
import type { PartialCustomElementDefinition } from '../resources/custom-element';
import type { IWatchDefinition, IWatcherCallback } from '../watch';
import type { LifecycleHooksLookup } from './lifecycle-hooks';
import type { IViewFactory } from './view';
import { IBinding } from '../binding/interfaces-bindings';

export class Controller<C extends IViewModel = IViewModel> implements IController<C> {

  public head: IHydratedController | null = null;
  public tail: IHydratedController | null = null;
  public next: IHydratedController | null = null;

  public parent: IHydratedController | null = null;
  public bindings: IBinding[] | null = null;
  public children: Controller[] | null = null;

  public scope: Scope | null = null;
  public isBound: boolean = false;
  /** @internal */
  private _isBindingDone: boolean = false;

  public mountTarget: MountTarget = targetNone;
  public shadowRoot: ShadowRoot | null = null;
  public nodes: INodeSequence | null = null;
  public location: IRenderLocation | null = null;

  /**
   * SSR manifest scope for this controller.
   * - For CEs: ISSRScope with children array
   * - For TCs: ISSRTemplateController with views array
   * Set during hydration, consumed once in attaching().
   */
  public ssrScope?: ISSRScopeChild;

  /** @internal */
  public _lifecycleHooks: LifecycleHooksLookup<ICompileHooks & IActivationHooks<IHydratedController>> | null = null;
  public get lifecycleHooks(): LifecycleHooksLookup<ICompileHooks & IActivationHooks<IHydratedController>> | null {
    return this._lifecycleHooks;
  }

  public state: State = none;

  // No promoted operation currently owns this Controller. Fully synchronous
  // transitions can remain `null` throughout; a step is also the generation
  // token once this Controller yields, fails, overlaps, or joins.
  /** @internal */
  public _operation: ControllerStep | null = null;

  public get isActive(): boolean {
    return (this.state & (activating | activated)) > 0 && (this.state & deactivating) === 0;
  }

  /**
   * Whether this controller is participating in its initiator's activation rollback.
   * This is intentionally operation-wide so unpromoted descendants can distinguish
   * compensation from an ordinary owner-requested teardown.
   * @internal
   */
  public get isActivationRollback(): boolean {
    return (this.$initiator as Controller | null)?._operation?.operation.mode === 'activation-rollback';
  }

  public get name(): string {
    if (this.parent === null) {
      switch (this.vmKind) {
        case vmkCa:
          return `[${this.definition!.name}]`;
        case vmkCe:
          return this.definition!.name;
        case vmkSynth:
          return this.viewFactory!.name;
      }
    }
    switch (this.vmKind) {
      case vmkCa:
        return `${this.parent.name}>[${this.definition!.name}]`;
      case vmkCe:
        return `${this.parent.name}>${this.definition!.name}`;
      case vmkSynth:
        return this.viewFactory!.name === this.parent.definition?.name
          ? `${this.parent.name}[view]`
          : `${this.parent.name}[view:${this.viewFactory!.name}]`;
    }
  }

  /** @internal */
  private _compiledDef: CustomElementDefinition | undefined;
  private logger!: ILogger;
  private debug!: boolean;
  /** @internal */
  private _fullyNamed: boolean = false;
  /** @internal */
  private readonly _rendering: IRendering;

  /** @internal */
  public _vmHooks: HooksDefinition;

  /** @internal */
  public _vm: ControllerBindingContext<C> | null;
  public get viewModel(): ControllerBindingContext<C> | null {
    return this._vm;
  }
  public set viewModel(v: ControllerBindingContext<C> | null) {
    this._vm = v;
    this._vmHooks = v == null || this.vmKind === vmkSynth ? HooksDefinition.none : new HooksDefinition(v);
  }

  public get strict() {
    return (this.definition as CustomElementDefinition)?.strict;
  }

  public constructor(
    public container: IContainer,
    public readonly vmKind: ViewModelKind,
    public readonly definition: CustomElementDefinition | CustomAttributeDefinition | null,
    /**
     * The viewFactory. Only present for synthetic views.
     */
    public viewFactory: IViewFactory | null,
    /**
     * The backing viewModel. Only present for custom attributes and elements.
     */
    viewModel: ControllerBindingContext<C> | null,
    /**
     * The physical host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    public host: HTMLElement | null,
    /**
     * The render location replacement for the host on containerless elements
     */
    location: IRenderLocation | null,
  ) {
    this._vm = viewModel;
    this._vmHooks = vmKind === vmkSynth ? HooksDefinition.none : new HooksDefinition(viewModel!);
    if (__DEV__) {
      this.logger = null!;
      this.debug = false;
    }
    this.location = location;
    this._rendering = container.root.get(IRendering);
  }

  public static getCached<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> | undefined {
    return controllerLookup.get(viewModel) as ICustomElementController<C> | undefined;
  }

  public static getCachedOrThrow<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> {
    const $el = Controller.getCached(viewModel);
    if ($el === void 0) {
      throw createMappedError(ErrorNames.controller_cached_not_found, viewModel);
    }
    return $el as ICustomElementController<C>;
  }

  /**
   * Create a controller for a custom element based on a given set of parameters
   *
   * @param ctn - The own container of the custom element
   * @param viewModel - The view model object (can be any object if a definition is specified)
   *
   * Semi private API
   */
  public static $el<C extends ICustomElementViewModel = ICustomElementViewModel>(
    ctn: IContainer,
    viewModel: C,
    host: HTMLElement,
    hydrationInst: IControllerElementHydrationInstruction | null,
    // Use this when `instance.constructor` is not a custom element type
    // to pass on the CustomElement definition
    definition: CustomElementDefinition | undefined = void 0,
    // the associated render location of the host
    // if the element is containerless
    location: IRenderLocation | null = null,
    // SSR manifest scope for this custom element
    ssrScope: ISSRScope | null = null,
  ): ICustomElementController<C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomElementController<C>;
    }

    if (__DEV__) {
      if (definition == null) {
        try {
          definition = getElementDefinition(viewModel.constructor as Constructable);
        } catch (ex) {
          // eslint-disable-next-line
          console.error(`[DEV:aurelia] Custom element definition not found for creating a controller with host: <${host.nodeName} /> and component ${viewModel.constructor.name || '(Anonymous) class'}`);
          throw ex;
        }
      }
    } else {
      definition = definition ?? getElementDefinition(viewModel.constructor as Constructable);
    }

    registerResolver(ctn, definition.Type, new InstanceProvider<typeof definition.Type>(definition.key, viewModel, definition.Type));
    const controller = new Controller<C>(
      /* container      */ctn,
      /* vmKind         */vmkCe,
      /* definition     */definition,
      /* viewFactory    */null,
      /* viewModel      */viewModel as ControllerBindingContext<C>,
      /* host           */host,
      /* location       */location,
    );
    // the hydration context this controller is provided with
    const hydrationContext = ctn.get(optional(IHydrationContext)) as IHydrationContext;

    if (definition.dependencies.length > 0) {
      ctn.register(...definition.dependencies);
    }
    // each CE controller provides its own hydration context for its internal template
    registerResolver(ctn, IHydrationContext, new InstanceProvider(
      'IHydrationContext',
      new HydrationContext(
        controller as ICustomElementController,
        hydrationInst,
        hydrationContext,
      )
    ));
    controllerLookup.set(viewModel, controller as Controller);

    // Store SSR scope for tree-based hydration
    if (ssrScope != null) {
      controller.ssrScope = ssrScope;
    }

    if (hydrationInst == null || hydrationInst.hydrate !== false) {
      controller._hydrateCustomElement(hydrationInst);
    }

    return controller as ICustomElementController<C>;
  }

  /**
   * Create a controller for a custom attribute based on a given set of parameters
   *
   * @param ctn - own container associated with the custom attribute object
   * @param viewModel - the view model object
   * @param host - host element where this custom attribute is used
   * @param flags - todo(comment)
   * @param definition - the definition of the custom attribute,
   * will be used to override the definition associated with the view model object contructor if given
   */
  public static $attr<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(
    ctn: IContainer,
    viewModel: C,
    host: HTMLElement,
    /**
     * The definition that will be used to hydrate the custom attribute view model
     *
     * If not given, will be the one associated with the constructor of the attribute view model given.
     */
    definition?: CustomAttributeDefinition,
    /**
     * SSR manifest entry for template controllers.
     * Contains views array with nodeCount for DOM partitioning.
     */
    ssrScope?: ISSRTemplateController,
  ): ICustomAttributeController<C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomAttributeController<C>;
    }

    definition = definition ?? getAttributeDefinition(viewModel.constructor as Constructable);
    registerResolver(ctn, definition.Type, new InstanceProvider<typeof definition.Type>(definition.key, viewModel, definition.Type));

    const controller = new Controller<C>(
      /* own ct         */ctn,
      /* vmKind         */vmkCa,
      /* definition     */definition,
      /* viewFactory    */null,
      /* viewModel      */viewModel as ControllerBindingContext<C>,
      /* host           */host,
      /* location       */null
    );

    if (definition.dependencies.length > 0) {
      ctn.register(...definition.dependencies);
    }

    controllerLookup.set(viewModel, controller as Controller);

    // Store SSR scope for tree-based hydration (template controllers)
    if (ssrScope != null) {
      controller.ssrScope = ssrScope;
    }

    controller._hydrateCustomAttribute();

    return controller as unknown as ICustomAttributeController<C>;
  }

  /**
   * Create a synthetic view (controller) for a given factory
   *
   * @param viewFactory - todo(comment)
   * @param flags - todo(comment)
   * @param parentController - the parent controller to connect the created view with. Used in activation
   * @param host - when it's desirable to associate a synthetic view with a host node during hydration,
   * it's possible to do so if a host is given here.
   *
   * Semi private API
   */
  public static $view(
    viewFactory: IViewFactory,
    parentController: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined = void 0,
    host: HTMLElement | null = null,
  ): ISyntheticView {
    const controller = new Controller(
      /* container      */viewFactory.container,
      /* vmKind         */vmkSynth,
      /* definition     */null,
      /* viewFactory    */viewFactory,
      /* viewModel      */null,
      /* host           */host,
      /* location       */null
    );
    controller.parent = parentController ?? null;

    controller._hydrateSynthetic();

    return controller as unknown as ISyntheticView;
  }

  /**
   * Create a synthetic view (controller) that adopts existing DOM nodes.
   *
   * Used for SSR hydration of template controller views. Instead of cloning
   * from a template, the view wraps pre-existing DOM nodes.
   *
   * @param viewFactory - The view factory
   * @param parentController - Parent controller
   * @param adoptedNodes - Pre-existing DOM nodes to adopt
   * @param ssrScope - SSR manifest scope for nested hydration
   */
  public static $viewAdopted(
    viewFactory: IViewFactory,
    parentController: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined,
    adoptedNodes: INodeSequence,
    ssrScope?: ISSRScope,
  ): ISyntheticView {
    const controller = new Controller(
      /* container      */viewFactory.container,
      /* vmKind         */vmkSynth,
      /* definition     */null,
      /* viewFactory    */viewFactory,
      /* viewModel      */null,
      /* host           */null,
      /* location       */null
    );
    controller.parent = parentController ?? null;

    // Set SSR scope for nested hydration
    if (ssrScope != null) {
      controller.ssrScope = ssrScope;
    }

    // Hydrate with adopted nodes instead of cloning
    controller._hydrateSyntheticAdopted(adoptedNodes);

    return controller as unknown as ISyntheticView;
  }

  /** @internal */
  public _hydrateCustomElement(
    hydrationInst: IControllerElementHydrationInstruction | null,
  ): void {
    if (__DEV__) {
      this.logger = this.container.get(ILogger).root;
      this.debug = this.logger.config.level <= LogLevel.debug;
      if (this.debug) {
        this.logger = this.logger.scopeTo(this.name);
      }
    }

    const container = this.container;
    const instance = this._vm!;
    const definition = this.definition as CustomElementDefinition;

    this.scope = Scope.create(instance, null, true);

    if (definition.watches.length > 0) {
      createWatchers(this, container, definition, instance);
    }
    createObservers(this, definition, instance as IIndexable<ICustomElementViewModel>);

    this._lifecycleHooks = LifecycleHooks.resolve(container);
    // Support Recursive Components by adding self to own context
    container.register(definition.Type);
    // definition.register(container);

    if (definition.injectable !== null) {
      registerResolver(
        container,
        definition.injectable,
        new InstanceProvider('definition.injectable', instance as ICustomElementViewModel),
      );
    }

    // If this is the root controller, then the AppRoot will invoke things in the following order:
    // - Controller.hydrateCustomElement
    // - runAppTasks('hydrating') // may return a promise
    // - Controller.compile
    // - runAppTasks('hydrated') // may return a promise
    // - Controller.compileChildren
    // This keeps hydration synchronous while still allowing the composition root compile hooks to do async work.
    if (hydrationInst == null || hydrationInst.hydrate !== false) {
      this._hydrate();
      this._hydrateChildren();
    }
  }

  /** @internal */
  public _hydrate(): void {
    if (this._lifecycleHooks!.hydrating != null) {
      this._lifecycleHooks!.hydrating.forEach(callHydratingHook, this);
    }
    if (this._vmHooks._hydrating) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`invoking hydrating() hook`); }
      this._vm!.hydrating(this as ICustomElementController);
    }

    const definition = this.definition!;
    const compiledDef = this._compiledDef = this._rendering.compile(definition as CustomElementDefinition, this.container);
    const shadowOptions = compiledDef.shadowOptions;
    const hasSlots = compiledDef.hasSlots;
    const containerless = compiledDef.containerless;
    const host = this.host!;
    let location: IRenderLocation | null = this.location;

    if (containerless && location == null) {
      location = this.location = convertToRenderLocation(host);
    }

    setRef(host, elementBaseName, this as IHydratedController);
    setRef(host, definition.key, this as IHydratedController);
    if (shadowOptions !== null || hasSlots) {
      if (location != null) {
        throw createMappedError(ErrorNames.controller_no_shadow_on_containerless);
      }
      setRef(this.shadowRoot = host.attachShadow(shadowOptions ?? defaultShadowOptions), elementBaseName, this as IHydratedController);
      setRef(this.shadowRoot, definition.key, this as IHydratedController);
      this.mountTarget = targetShadowRoot;
    } else if (location != null) {
      // when template compiler encounter a "containerless" attribute
      // it replaces the element with a render location
      // making the controller receive the same comment node as both host and location
      // todo: consider making template compiler less eager to replace
      //       this has performance implication when using ad-hoc containerless
      if (host !== location) {
        setRef(location, elementBaseName, this as IHydratedController);
        setRef(location, definition.key, this as IHydratedController);
      }
      this.mountTarget = targetLocation;
    } else {
      this.mountTarget = targetHost;
    }

    (this._vm as Writable<C>).$controller = this;

    // SSR hydration: adopt existing DOM instead of cloning from template
    if (this.ssrScope != null) {
      this.nodes = this._rendering.adoptNodes(host);
    } else {
      this.nodes = this._rendering.createNodes(compiledDef);
    }

    if (this._lifecycleHooks!.hydrated !== void 0) {
      this._lifecycleHooks!.hydrated.forEach(callHydratedHook, this);
    }

    if (this._vmHooks._hydrated) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`invoking hydrated() hook`); }
      this._vm!.hydrated(this as ICustomElementController);
    }
  }

  /** @internal */
  public _hydrateChildren(): void {
    const targets = this.nodes!.findTargets();

    this._rendering.render(
      /* controller */this as ICustomElementController,
      /* targets    */targets,
      /* definition */this._compiledDef!,
      /* host       */this.host,
    );

    if (this._lifecycleHooks!.created !== void 0) {
      this._lifecycleHooks!.created.forEach(callCreatedHook, this);
    }
    if (this._vmHooks._created) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`invoking created() hook`); }
      this._vm!.created(this as ICustomElementController);
    }
  }

  /** @internal */
  private _hydrateCustomAttribute(): void {
    const definition = this.definition as CustomAttributeDefinition;
    const instance = this._vm!;

    if (definition.watches.length > 0) {
      createWatchers(this, this.container, definition, instance);
    }
    createObservers(this, definition, instance as unknown as IIndexable<ICustomAttributeViewModel>);

    (instance as Writable<C>).$controller = this;
    this._lifecycleHooks = LifecycleHooks.resolve(this.container);

    if (this._lifecycleHooks!.created !== void 0) {
      this._lifecycleHooks!.created.forEach(callCreatedHook, this);
    }
    if (this._vmHooks._created) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`invoking created() hook`); }
      this._vm!.created(this as ICustomAttributeController);
    }
  }

  /** @internal */
  private _hydrateSynthetic(): void {
    this._compiledDef = this._rendering.compile(this.viewFactory!.def, this.container);
    this._rendering.render(
      /* controller */this as ISyntheticView,
      /* targets    */(this.nodes = this._rendering.createNodes(this._compiledDef)).findTargets(),
      /* definition */this._compiledDef,
      /* host       */this.host,
    );
  }

  /**
   * Hydrate a synthetic view with adopted DOM nodes (for SSR hydration).
   *
   * Instead of creating nodes by cloning, this uses pre-existing DOM nodes
   * that were rendered by the server. The targets are collected from the
   * adopted nodes and bindings are applied to them.
   *
   * @internal
   */
  private _hydrateSyntheticAdopted(adoptedNodes: INodeSequence): void {
    this._compiledDef = this._rendering.compile(this.viewFactory!.def, this.container);
    // Use adopted nodes instead of cloning from template
    this.nodes = adoptedNodes;
    // Render to the adopted nodes' targets
    const targets = adoptedNodes.findTargets();
    this._rendering.render(
      /* controller */this as ISyntheticView,
      /* targets    */targets,
      /* definition */this._compiledDef,
      /* host       */this.host,
    );
  }

  private $initiator: IHydratedController = null!;

  /** @internal */
  private _ensureStep(
    kind: LifecycleOperationKind,
    initiator: Controller,
    parent: Controller | null,
  ): ControllerStep {
    const current = this._operation;
    if (current !== null && current.operation.mode !== 'settled') {
      /* istanbul ignore next -- active steps are created only by this operation's captured ancestry */
      if (current.operation.initiator !== initiator) {
        throw createMappedError(ErrorNames.controller_activation_unexpected_state, this.name, stringifyState(this.state));
      }
      // Activation rollback may change kind in place; an opposite request can
      // also reuse a live operation whose kind differs. Initiator identity owns
      // both forms of reuse.
      return current;
    }

    let parentStep: ControllerStep | null = null;
    let operation: LifecycleOperation;
    if (this === initiator) {
      // Promotion snapshots the teardown list before async callbacks can clear
      // the public list or change parent/$initiator for a successor transition.
      operation = {
        initiator,
        kind,
        mode: 'running',
        desired: {
          active: kind === 'activate',
          initiator,
          parent,
          scope: this.scope,
        },
        teardownHead: this.head as Controller | null,
        teardownTail: this.tail as Controller | null,
        suppressActivationError: false,
      };
    } else {
      // Build immutable operation ancestry alongside the existing counter
      // propagation path. Async callbacks use this chain instead of mutable
      // Controller.parent after yielding.
      parentStep = parent!._ensureStep(kind, initiator, parent!.parent as Controller | null);
      operation = parentStep.operation;
    }

    const step: ControllerStep = {
      operation,
      controller: this,
      parent: parentStep,
      parentController: parent,
      disposeRequested: false,
    };
    this._operation = step;
    return step;
  }

  /** @internal */
  private _ensureOperationResult(step: ControllerStep): Promise<void> {
    let current: ControllerStep | null = step;
    while (current !== null) {
      if (current.result === void 0) {
        const result = current.result = createLifecycleDeferred(current);
        if (current.operation.initiator !== current.controller) {
          // Descendant results mirror their part of the shared operation so a
          // direct caller can await that path. Ancestor-driven traversal does
          // not expose every descendant result, however; the initiator's drain
          // is the public error owner in that case. Observe the local mirror so
          // it cannot become an orphaned rejection when no direct caller exists.
          void result.promise.catch(noop);
        }
      }
      current = current.parent;
    }
    // `drain` always means the initiator boundary, even when this method was
    // asked for a descendant-local result.
    step.operation.drain ??= step.operation.initiator._operation!.result;
    return step.result!.promise;
  }

  /** @internal */
  private _recordOperationError(
    step: ControllerStep,
    order: number | undefined,
    error: unknown,
  ): void {
    if (error instanceof OrderedLifecycleFailure) {
      recordStepError(step, error.order, error.error);
    } else {
      recordStepError(step, order ?? reserveLifecycleParticipant(), error);
    }
  }

  /** @internal */
  private _invokePhase(
    phase: InvocableLifecyclePhase,
    initiator: IHydratedController,
    parent: IHydratedController | null,
    bestEffort: boolean,
  ): void | Promise<void> {
    return invokeControllerPhase(this, phase, initiator, parent, bestEffort, this._operation?.operation);
  }

  /** @internal */
  private _observeOperationParticipant(
    promise: Promise<void>,
    step: ControllerStep,
    order: number,
    onFulfilled: () => void,
    onFailure: () => void,
  ): void {
    // Operation-result deferreds are the stable Promises exposed by Controller
    // calls. This observer advances counters and records continuation failures
    // without replacing those boundaries with a new .then() chain.
    void promise.then(
      () => {
        // Framework continuations contain their own phase/cleanup errors before
        // returning; the participant observer only advances their counters.
        onFulfilled();
      },
      error => {
        this._recordOperationError(step, order, error);
        onFailure();
      },
    );
  }

  /** @internal */
  private _settleStep(step: ControllerStep): void {
    const deferred = step.result;
    if (step.operation.kind === 'activate') this._activatingStack = 0;
    else this._detachingStack = this._unbindingStack = 0;
    // Release operation identity before resolving/rejecting: Promise reactions
    // may request the next Controller transition as soon as the deferred settles.
    this._operation = null;
    if (step.operation.initiator === this) {
      // Descendant steps settle locally while ancestors or siblings may still
      // participate in the shared operation; only its initiator closes it.
      step.operation.mode = 'settled';
    }
    const error = this._finalizeOperationError(step);
    if (deferred !== void 0) {
      if (error === void 0) {
        deferred.resolve();
      } else {
        deferred.reject(error.error);
      }
    }
  }

  /** @internal */
  private _throwSynchronousOperationError(step: ControllerStep): void {
    // Keep a promoted-but-synchronous failure as a raw synchronous throw. A
    // Controller should not become async merely because compensation needed an
    // operation record but no participant actually yielded.
    if (this._operation === step) {
      this._operation = null;
    }
    this._activatingStack = this._detachingStack = this._unbindingStack = 0;
    step.operation.mode = 'settled';
    const error = this._finalizeOperationError(step);
    if (error !== void 0) {
      throw error.error;
    }
  }

  /** @internal */
  private _finalizeOperationError(step: ControllerStep): LifecycleErrorRecord | undefined {
    // Requested disposal belongs to this settlement. Run it after operation
    // identity is released, but before choosing the public error, so disposal
    // failures retain their causal order without changing sync/async delivery.
    if (step.disposeRequested) {
      try {
        this._disposeCore();
      } catch (error) {
        this._recordOperationError(step, void 0, error);
      }
    }
    return getOperationError(step);
  }

  public activate(
    initiator: IHydratedController,
    parent: IHydratedController | null,
    scope?: Scope | null,
  ): void | Promise<void> {
    switch ((this.state & ~released)) {
      case none:
      case deactivated:
        if (!(parent === null || parent.isActive)) {
          // If this is not the root, and the parent is either:
          // 1. Not activated, or activating children OR
          // 2. Deactivating itself
          // abort.
          return;
        }
        // Otherwise, proceed normally.
        // 'deactivated' and 'none' are treated the same because, from an activation perspective, they mean the same thing.
        this.state = activating;
        break;
      case activating:
        return this._operation?.result?.promise;
      case deactivating:
        if (!(parent === null || parent.isActive)) {
          return;
        }
        {
          const currentInitiator = this.$initiator as Controller;
          const step = this._operation ?? this._ensureStep('deactivate', currentInitiator, this.parent as Controller | null);
          /* istanbul ignore next -- valid traversal sees the real parent deactivating and fails admission above */
          if (step.operation.initiator !== this) {
            // Reject invalid cross-parent re-entry without letting it overwrite
            // the ancestor operation's desired root with descendant arguments.
            return step.operation.drain?.promise;
          }
          const request: TransitionRequest = {
            active: true,
            initiator: initiator as Controller,
            parent: parent as Controller | null,
            scope,
          };
          step.operation.desired = request;
          return this._ensureOperationResult(step);
        }
      case activated:
        // If we're already activated, no need to do anything.
        return;
      case disposed:
        throw createMappedError(ErrorNames.controller_activating_disposed, this.name);
      default:
        throw createMappedError(ErrorNames.controller_activation_unexpected_state, this.name, stringifyState(this.state));
    }

    this.parent = parent;
    if (__DEV__ && this.debug && !this._fullyNamed) {
      this._fullyNamed = true;
      (this.logger ??= this.container.get(ILogger).root.scopeTo(this.name)).trace(`activate()`);
    }

    switch (this.vmKind) {
      case vmkCe:
        // Custom element scope is created and assigned during hydration
        (this.scope as Writable<Scope>).parent = scope ?? null;
        break;
      case vmkCa:
        this.scope = scope ?? null;
        break;
      case vmkSynth:
        // maybe only check when there's not already a scope
        if (scope === void 0 || scope === null) {
          throw createMappedError(ErrorNames.controller_activation_synthetic_no_scope, this.name);
        }

        this.scope = scope;
        break;
    }

    this.$initiator = initiator;

    // One base participant spans binding through child activation and attached;
    // the successful attach path or activation compensation closes it.
    this._enterActivating(initiator, parent);
    // Hookless views stay on the historical direct path. Besides avoiding
    // allocations, this keeps large Repeat trees at their established cost.
    if (
      this.vmKind === vmkSynth
      || this._lifecycleHooks!.binding == null && !this._vmHooks._binding
    ) {
      this._isBindingDone = true;
      return this.bind(initiator, parent);
    }
    return this._runSequentialActivationPhase('binding', initiator, parent);
  }

  /** @internal */
  private _runSequentialActivationPhase(
    phase: 'binding' | 'bound',
    initiator: IHydratedController,
    parent: IHydratedController | null,
  ): void | Promise<void> {
    let result: void | Promise<void>;
    try {
      result = this._invokePhase(phase, initiator, parent, false);
    } catch (error) {
      return this._failActivationPhase(initiator, parent, error);
    }
    if (isPromise(result)) {
      const step = this._promoteActivationPhase(initiator, parent);
      const drain = this._ensureOperationResult(step);
      this._observeOperationParticipant(
        result,
        step,
        getLifecyclePromiseOrder(result) ?? reserveLifecycleParticipant(),
        // The next phase enrolls its own participants in this operation.
        // Chaining its Promise here would count the same work twice.
        () => { void this._completeActivationPhase(phase, initiator, parent, step); },
        () => this._leaveActivating(initiator, parent, step),
      );
      return drain;
    }
    return this._completeActivationPhase(phase, initiator, parent, this._operation ?? void 0);
  }

  /** @internal */
  private _promoteActivationPhase(
    initiator: IHydratedController,
    parent: IHydratedController | Controller | null,
  ): ControllerStep {
    return this._ensureStep('activate', initiator as Controller, parent as Controller | null);
  }

  /** @internal */
  private _failActivationPhase(
    initiator: IHydratedController,
    parent: IHydratedController | Controller | null,
    error: unknown,
  ): void | Promise<void> {
    const step = this._promoteActivationPhase(initiator, parent);
    this._recordOperationError(step, void 0, error);
    this._leaveActivating(initiator, parent as IHydratedController | null, step);
    return step.result?.promise;
  }

  /** @internal */
  private _completeActivationPhase(
    phase: 'binding' | 'bound',
    initiator: IHydratedController,
    parent: IHydratedController | null,
    step: ControllerStep | undefined,
  ): void | Promise<void> {
    // Record phase progress before checking cancellation. Compensation must
    // undo work that actually committed even when an opposite request arrived
    // while the phase Promise was pending.
    if (phase === 'binding') {
      this._isBindingDone = true;
    } else {
      this.isBound = true;
    }
    if (this.state !== activating || step !== void 0 && !step.operation.desired.active) {
      this._leaveActivating(initiator, parent, step);
      return step?.result?.promise;
    }
    return phase === 'binding' ? this.bind(initiator, parent) : this._attach(initiator, parent);
  }

  private bind(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void> {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`bind()`); }

    let i = 0;
    let ii = 0;
    if (this.bindings !== null) {
      i = 0;
      ii = this.bindings.length;
      while (ii > i) {
        try {
          this.bindings[i].bind(this.scope!);
          ++i;
        } catch (error) {
          const step = this._ensureStep('activate', initiator as Controller, parent as Controller | null);
          this._recordOperationError(step, void 0, error);
          this._leaveActivating(initiator, parent, step);
          return step.result?.promise;
        }
      }
    }
    if (
      this.vmKind === vmkSynth
      || this._lifecycleHooks!.bound == null && !this._vmHooks._bound
    ) {
      this.isBound = true;
      return this._attach(initiator, parent);
    }
    return this._runSequentialActivationPhase('bound', initiator, parent);
  }

  /** @internal */
  private _append(...nodes: Node[]): void {
    switch (this.mountTarget) {
      case targetHost:
        this.host!.append(...nodes);
        break;
      case targetShadowRoot:
        this.shadowRoot!.append(...nodes);
        break;
      case targetLocation: {
        let i = 0;
        for (; i < nodes.length; ++i) {
          this.location!.parentNode!.insertBefore(nodes[i], this.location);
        }
        break;
      }
    }
  }

  /** @internal */
  private _attach(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void> {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`attach()`); }

    try {
      switch (this.mountTarget) {
        case targetHost:
          this.nodes!.appendTo(this.host!, this.definition != null && (this.definition as CustomElementDefinition).enhance);
          break;
        case targetShadowRoot: {
          const container = this.container;
          const styles = container.has(IShadowDOMStyles, false)
            ? container.get(IShadowDOMStyles)
            : container.get(IShadowDOMGlobalStyles);
          styles.applyTo(this.shadowRoot!);
          this.nodes!.appendTo(this.shadowRoot!);
          break;
        }
        case targetLocation:
          this.nodes!.insertBefore(this.location!);
          break;
      }
    } catch (error) {
      const step = this._ensureStep('activate', initiator as Controller, parent as Controller | null);
      this._recordOperationError(step, void 0, error);
      this._leaveActivating(initiator, parent, step);
      return step.result?.promise;
    }

    let ret: Promise<void> | void = void 0;
    if (
      this.vmKind !== vmkSynth
      && (this._lifecycleHooks!.attaching != null || this._vmHooks._attaching)
    ) {
      try {
        ret = this._invokePhase('attaching', initiator, parent, false);
      } catch (error) {
        return this._failActivationPhase(initiator, parent, error);
      }
    }

    if (isPromise(ret)) {
      const step = this._promoteActivationPhase(initiator, parent);
      // The observer and activation counter own completion; this only exposes
      // stable result boundaries to direct callers and the initiator.
      void this._ensureOperationResult(step);
      // attaching and child activation remain parallel. A counter participant
      // joins the shared barrier; both outcomes release it because rejection is
      // recorded separately by the observer.
      this._enterActivating(initiator, parent, step);
      this._observeOperationParticipant(
        ret,
        step,
        getLifecyclePromiseOrder(ret) ?? reserveLifecycleParticipant(),
        () => this._leaveActivating(initiator, parent, step),
        () => this._leaveActivating(initiator, parent, step),
      );
    }

    // Attaching and child activation are admitted in parallel. The base
    // participant below reaches zero only after both are done, then starts
    // `attached`.
    if (this.children !== null) {
      for (let i = 0; i < this.children.length; ++i) {
        const child = this.children[i];
        const childResult = child.activate(initiator, this as IHydratedController, this.scope);
        const childStep = child._operation;
        if (isPromise(childResult) && childStep !== null && childStep.operation.initiator !== initiator) {
          this._joinActivation(childStep, childResult, initiator, parent);
        }
        // Normally descendant work already propagates through this initiator's
        // counters, so its local result needs no second ownership edge here.
      }
    }

    this._leaveActivating(initiator, parent, this._operation ?? void 0);
    return this._operation?.result?.promise;
  }

  /** @internal */
  private _joinActivation(
    childStep: ControllerStep,
    childResult: Promise<void>,
    initiator: IHydratedController,
    parent: IHydratedController | null,
  ): void {
    // A child belonging to a separately initiated operation did not increment
    // this ancestor's counters. Enroll its drain as one ancestor participant so
    // activation cannot publish success or begin rollback while the child is live.
    const source = this._operation ?? this._ensureStep(
      'activate',
      initiator as Controller,
      parent as Controller | null,
    );
    // The caller owns the ancestor operation. Create its drain before storing
    // that exact identity for cross-operation cycle detection.
    void this._ensureOperationResult(source);
    childStep.operation.joinedInto = source.operation.drain!.promise;
    this._enterActivating(initiator, parent, source);
    this._observeOperationParticipant(
      childResult,
      source,
      reserveLifecycleParticipant(),
      () => this._leaveActivating(initiator, parent, source),
      () => this._leaveActivating(initiator, parent, source),
    );
  }

  public deactivate(
    initiator: IHydratedController,
    parent: IHydratedController | null,
  ): void | Promise<void> {
    switch ((this.state & ~released)) {
      case activated:
        this.state = (deactivating | (this.state & released)) as State;
        break;
      case activating:
        {
          const activationInitiator = this.$initiator as Controller;
          const step = this._operation ?? this._ensureStep('activate', activationInitiator, this.parent as Controller | null);
          if (step.operation.mode === 'activation-rollback') {
            return this._startDeactivation(step, parent as Controller | null, activationInitiator);
          }
          step.operation.desired = {
            active: false,
            initiator: initiator as Controller,
            parent: parent as Controller | null,
          };
          step.operation.suppressActivationError = true;
          // Explicit deactivation supersedes the activation result, but waits
          // every participant already admitted before compensation begins.
          this.state = (deactivating | (this.state & released)) as State;
          if (step.operation.initiator !== initiator) {
            // A self-activating child is a separate operation. Ancestor teardown
            // must wait on its local drain through compensation; merely changing
            // the child's desired state would let the ancestor settle too early.
            this._joinDeactivation(step, initiator as Controller, parent as Controller | null);
            return;
          }
          return this._ensureOperationResult(step);
        }
      case deactivating:
        {
          const currentInitiator = this.$initiator as Controller;
          const step = this._operation ?? this._ensureStep('deactivate', currentInitiator, this.parent as Controller | null);
          if (step.operation.initiator !== initiator) {
            this._joinDeactivation(step, initiator as Controller, parent as Controller | null);
            return;
          }
          if (initiator !== this) {
            return;
          }
          if (getActiveLifecycleOperation() === step.operation) {
            // A hook may re-enter deactivate and return its current operation
            // Promise. Returning that Promise from the hook would make the
            // operation wait for itself, so the re-entrant call is a no-op.
            return;
          }
          step.operation.desired = {
            active: false,
            initiator: initiator as Controller,
            parent: parent as Controller | null,
          };
          return step.result?.promise ?? this._ensureOperationResult(step);
        }
      case none:
      case deactivated:
      case disposed:
      case deactivated | disposed:
        // If we're already deactivated (or even disposed), or never activated in the first place, no need to do anything.
        return;
      default:
        throw createMappedError(ErrorNames.controller_deactivation_unexpected_state, this.name, this.state);
    }

    /* istanbul-ignore-next */
    if (__DEV__ && this.debug) { this.logger!.trace(`deactivate()`); }

    return this._startDeactivation(
      this._operation ?? void 0,
      parent as Controller | null,
      initiator as Controller,
    );
  }

  /** @internal */
  private _joinDeactivation(
    childStep: ControllerStep,
    initiator: Controller,
    parent: Controller | null,
  ): void {
    // The child keeps its own initiator and local result. The later ancestor
    // operation enrolls that result as one cleanup participant instead of
    // stealing the child's counters or linking it into teardown twice.
    childStep.operation.desired = {
      active: false,
      initiator: childStep.operation.initiator,
      parent: childStep.parentController,
    };
    const source = parent!._ensureStep('deactivate', initiator, parent!.parent as Controller | null);
    const result = this._ensureOperationResult(childStep);
    // The caller owns the ancestor drain; ensure its identity exists before the
    // child records that drain as a cross-operation self-await boundary.
    void this._ensureOperationResult(source);
    childStep.operation.joinedInto = source.operation.drain!.promise;
    const order = reserveLifecycleParticipant();
    initiator._enterDetaching();
    parent!._observeOperationParticipant(
      result,
      source,
      order,
      () => initiator._leaveDetaching(),
      () => initiator._leaveDetaching(),
    );
  }

  /** @internal */
  private _startDeactivation(
    capturedStep: ControllerStep | undefined,
    parent: Controller | null,
    initiator: Controller = this,
  ): void | Promise<void> {
    this.state = (deactivating | (this.state & released)) as State;
    this.$initiator = initiator as IHydratedController;

    if (initiator === this) {
      // Only the initiator owns the base token. Descendant hooks add/remove
      // participants from this counter and deliberately return no local drain
      // to ancestor traversal.
      this._enterDetaching();
    }

    let ret: void | Promise<void> = void 0;

    if (this.children !== null) {
      for (let i = 0; i < this.children.length; ++i) {
        // Descendant teardown enrolls itself in the initiator barrier. Returning
        // or awaiting a local mirror here would add a second ownership edge.
        void this.children[i].deactivate(initiator as IHydratedController, this as IHydratedController);
      }
    }

    if (
      this.isBound
      && this.vmKind !== vmkSynth
      && (this._lifecycleHooks!.detaching != null || this._vmHooks._detaching)
    ) {
      try {
        ret = this._invokePhase('detaching', this.$initiator, this.parent, true);
      } catch (error) {
        const step = capturedStep ?? this._ensureStep('deactivate', initiator, parent);
        this._recordOperationError(step, void 0, error);
        capturedStep = step;
      }
    }

    // Hook invocation may synchronously re-enter and promote this Controller.
    // Recapture the step before enrolling the returned Promise.
    capturedStep ??= this._operation ?? void 0;
    if (
      isPromise(ret)
      && capturedStep !== void 0
      && isLifecycleOperationJoinedInto(capturedStep.operation, ret)
    ) {
      // This is an exact cross-operation ancestor-drain cycle. Continuing to
      // await it would leave both operations pending.
      const step = capturedStep;
      this._recordOperationError(
        step,
        getLifecyclePromiseOrder(ret) ?? reserveLifecycleParticipant(),
        new LifecycleSelfAwaitError(this.name, 'a lifecycle hook cannot await an ancestor drain that is waiting for this child operation'),
      );
      ret = void 0;
    }

    if (isPromise(ret)) {
      const step = capturedStep ?? this._ensureStep('deactivate', initiator, parent);
      // The observer and detaching counter own completion; this call only makes
      // the stable local/initiator deferred boundaries available to callers.
      void this._ensureOperationResult(step);
      initiator._enterDetaching();
      this._observeOperationParticipant(
        ret,
        step,
        getLifecyclePromiseOrder(ret) ?? reserveLifecycleParticipant(),
        () => initiator._leaveDetaching(),
        () => initiator._leaveDetaching(),
      );
      capturedStep = step;
    }

    // Link synchronously, before any detaching Promise resolves, so traversal
    // acceptance order—not Promise resolution order—defines DOM/unbind order.
    const operation = initiator._operation?.operation;
    const tail = operation?.teardownTail ?? initiator.tail as Controller | null;
    if (tail === null) {
      initiator.head = this as IHydratedController;
      if (operation !== void 0) operation.teardownHead = this;
    } else {
      tail.next = this as IHydratedController;
    }
    initiator.tail = this as IHydratedController;
    if (operation !== void 0) operation.teardownTail = this;

    if (initiator !== this) {
      // The initiator owns the public drain and closes its base token after all
      // descendants have linked themselves into deterministic teardown order.
      return;
    }

    this._leaveDetaching();
    const step = this._operation ?? capturedStep;
    const result = step?.result?.promise;
    if (result === void 0 && step !== void 0) {
      this._throwSynchronousOperationError(step);
    }
    return result;
  }

  private removeNodes(): void {
    switch (this.vmKind) {
      case vmkCe:
      case vmkSynth:
        this.nodes!.remove();
        this.nodes!.unlink();
    }
  }

  private unbind(settle: boolean = true): void {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`unbind()`); }

    let i = 0;

    if (this.bindings !== null) {
      for (; i < this.bindings.length; ++i) {
        try {
          this.bindings[i].unbind();
        } catch (error) {
          const initiator = this.$initiator as Controller;
          const step = this._operation ?? this._ensureStep('deactivate', initiator, this.parent as Controller | null);
          this._recordOperationError(step, void 0, error);
        }
      }
    }

    this.parent = null;

    switch (this.vmKind) {
      case vmkCa:
        this.scope = null;
        break;
      case vmkSynth:
        this.scope = null;
        {
          const step = this._operation;
          // release() is called before deactivate(); every deactivation state
          // transition preserves this bit until unbind consumes it here.
          const releaseRequested = (this.state & released) === released;
          // Ancestor-driven teardown returns no local result and the owner still
          // holds the view. Only a self-initiated release may transfer ownership
          // to the factory cache or dispose it here.
          if (releaseRequested && this.$initiator === this) {
            const retainForSuccessor = step !== null
              && step.operation.desired.active
              && getOperationError(step) === void 0;
            if (!retainForSuccessor) {
              // A superseded activation error can be hidden from its caller, but
              // the partially activated view is still unsafe to cache as healthy.
              const canCache = step?.firstError === void 0;
              const cached = canCache && this.viewFactory!.tryReturnToCache(this as ISyntheticView);
              if (!cached) {
                this._disposeReleasedView(step);
              }
            }
          }
        }
        break;
      case vmkCe:
        (this.scope as Writable<Scope>).parent = null;
        break;
    }

    this.state = (deactivated | (this.state & disposed)) as State;
    this.$initiator = null!;
    if (settle) {
      this._resolve();
    }
  }

  /** @internal */
  private _disposeReleasedView(step: ControllerStep | null | undefined): void {
    try {
      this._disposeCore();
    } catch (error) {
      const operationStep = step
        ?? this._operation
        ?? this._ensureStep('deactivate', this.$initiator as Controller, this.parent as Controller | null);
      this._recordOperationError(operationStep, reserveLifecycleParticipant(), error);
    }
  }

  /** @internal */
  private _resolve(): void {
    const step = this._operation;
    if (step === null) {
      return;
    }
    if (step.operation.initiator === this && step.result === void 0) {
      // A promoted synchronous error may still finish synchronously. Its raw
      // error is thrown by _throwSynchronousOperationError rather than converted
      // into a Promise merely because an operation record exists.
      return;
    }
    this._settleStep(step);
  }

  // Every enter propagates through the captured operation ancestry and every
  // leave mirrors it exactly once. Local zero means all accepted work in this
  // Controller subtree has quiesced; initiator zero means the whole operation.
  /** @internal */
  private _activatingStack: number = 0;
  /** @internal */
  private _enterActivating(
    initiator: IHydratedController,
    parent: IHydratedController | null,
    capturedStep?: ControllerStep,
  ): void {
    const step = capturedStep ?? this._operation;
    ++this._activatingStack;
    if (initiator !== this) {
      const operationParent = step?.parent?.controller ?? parent as Controller;
      operationParent._enterActivating(initiator, operationParent.parent, step?.parent ?? void 0);
    }
  }
  /** @internal */
  private _leaveActivating(
    initiator: IHydratedController,
    parent: IHydratedController | null,
    capturedStep?: ControllerStep,
  ): void {
    const step = capturedStep ?? this._operation ?? void 0;
    const operationParent = step?.parent?.controller ?? parent as Controller | null;
    const pending = --this._activatingStack;
    if (this.state !== activating) {
      if (pending === 0 && step !== void 0 && (step.firstError !== void 0 || !step.operation.desired.active)) {
        this._finishFailedActivation(initiator, operationParent, step);
        return;
      } else if (pending === 0) {
        this._resolve();
      }
      if (initiator !== this) {
        operationParent!._leaveActivating(initiator, operationParent!.parent, step?.parent ?? void 0);
      }
      return;
    }
    if (pending === 0) {
      if (step !== void 0 && (step.firstError !== void 0 || !step.operation.desired.active)) {
        this._finishFailedActivation(initiator, operationParent, step);
        return;
      }

      let attachedResult: void | Promise<void>;
      if (
        this.vmKind === vmkSynth
        || this._lifecycleHooks!.attached == null && !this._vmHooks._attached
      ) {
        attachedResult = void 0;
      } else {
        try {
          attachedResult = this._invokePhase('attached', initiator, null, false);
        } catch (error) {
          const operationStep = step ?? this._promoteActivationPhase(initiator, operationParent);
          this._recordOperationError(operationStep, void 0, error);
          this._finishFailedActivation(initiator, operationParent, operationStep);
          return;
        }
      }

      if (isPromise(attachedResult)) {
        const operationStep = step ?? this._promoteActivationPhase(initiator, operationParent);
        // The observer owns completion; this only exposes stable result
        // boundaries for direct callers and the initiator.
        void this._ensureOperationResult(operationStep);
        this._observeOperationParticipant(
          attachedResult,
          operationStep,
          getLifecyclePromiseOrder(attachedResult) ?? reserveLifecycleParticipant(),
          () => this._finishSuccessfulActivation(initiator, operationParent, operationStep),
          () => this._finishFailedActivation(initiator, operationParent, operationStep),
        );
        return;
      }
      this._finishSuccessfulActivation(initiator, operationParent, step);
    }
    if (pending !== 0 && initiator !== this) {
      operationParent!._leaveActivating(initiator, operationParent!.parent, step?.parent ?? void 0);
    }
  }

  /** @internal */
  private _finishSuccessfulActivation(
    initiator: IHydratedController,
    parent: Controller | null,
    step?: ControllerStep,
  ): void {
    if (step !== void 0 && !step.operation.desired.active) {
      this._finishFailedActivation(initiator, parent, step);
      return;
    }
    this.state = activated;
    if (step !== void 0) {
      this._settleStep(step);
    }
    if (initiator !== this) {
      parent!._leaveActivating(initiator, parent!.parent, step?.parent ?? void 0);
    }
  }

  /** @internal */
  private _finishFailedActivation(
    initiator: IHydratedController,
    parent: Controller | null,
    step: ControllerStep,
  ): void {
    if (initiator !== this) {
      // Local callers may observe this descendant boundary now. The initiator
      // remains pending until sibling work and whole-tree rollback quiesce.
      this._settleStep(step);
      parent!._leaveActivating(initiator, parent!.parent, step.parent ?? void 0);
      return;
    }

    // Compensation remains part of the failed activation operation so its
    // original error and every cleanup participant settle one stable drain.
    step.operation.mode = 'activation-rollback';
    step.operation.kind = 'deactivate';
    step.operation.desired = {
      active: false,
      initiator: this,
      parent,
    };
    // Compensation is already owned by this operation's counters. Discard only
    // its already-owned drain; a synchronous cleanup throw still propagates.
    void this._startDeactivation(step, parent);
  }

  /** @internal */
  private _detachingStack: number = 0;
  /** @internal */
  private _enterDetaching(): void {
    ++this._detachingStack;
  }
  /** @internal */
  private _leaveDetaching(): void {
    const operationStep = this._operation;
    if (--this._detachingStack === 0) {
      // Note: this controller is the initiator (detach is only ever called on the initiator)
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`detach()`); }

      // Open the base token before structural removal so node-removal failures
      // and every async unbinding hook admitted below share one cleanup barrier.
      this._enterUnbinding();
      try {
        this.removeNodes();
      } catch (error) {
        const step = this._operation ?? this._ensureStep('deactivate', this, this.parent as Controller | null);
        this._recordOperationError(step, void 0, error);
      }

      // A promoted operation owns a stable list captured before cleanup starts;
      // the public initiator list is fallback storage for the synchronous path.
      let cur = operationStep?.operation.teardownHead ?? this.$initiator.head as Controller | null;

      while (cur !== null) {
        if (cur !== this) {
          /* istanbul ignore next */
          if (cur.debug) { cur.logger!.trace(`detach()`); }

          try {
            cur.removeNodes();
          } catch (error) {
            const step = cur._operation ?? cur._ensureStep('deactivate', this, cur.parent as Controller | null);
            cur._recordOperationError(step, void 0, error);
          }
        }

        if (
          cur._isBindingDone
          && cur.vmKind !== vmkSynth
          && (cur._lifecycleHooks!.unbinding != null || cur._vmHooks._unbinding)
        ) {
          let result: void | Promise<void>;
          try {
            result = cur._invokePhase('unbinding', cur.$initiator, cur.parent, true);
          } catch (error) {
            const step = cur._operation ?? cur._ensureStep('deactivate', this, cur.parent as Controller | null);
            cur._recordOperationError(step, void 0, error);
            result = void 0;
          }
          if (isPromise(result)) {
            const step = cur._operation ?? cur._ensureStep('deactivate', this, cur.parent as Controller | null);
            // The unbinding counter/observer owns settlement; this only creates
            // the stable local result that disposal and direct callers may join.
            void cur._ensureOperationResult(step);
            this._enterUnbinding();
            cur._observeOperationParticipant(
              result,
              step,
              getLifecyclePromiseOrder(result) ?? reserveLifecycleParticipant(),
              () => this._leaveUnbinding(),
              () => this._leaveUnbinding(),
            );
          }
        }

        cur = cur.next as Controller;
      }

      this._leaveUnbinding();
    }
  }

  /** @internal */
  private _unbindingStack: number = 0;
  /** @internal */
  private _enterUnbinding(): void {
    ++this._unbindingStack;
  }
  /** @internal */
  private _leaveUnbinding(): void {
    const operationStep = this._operation;
    if (--this._unbindingStack === 0) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`unbind()`); }

      let cur = operationStep?.operation.teardownHead ?? this.$initiator.head as Controller | null;
      let next: Controller | null = null;
      while (cur !== null) {
        if (cur !== this) {
          cur._isBindingDone = false;
          cur.isBound = false;
          cur.unbind();
        }
        next = cur.next as Controller;
        cur.next = null;
        cur = next;
      }

      this.head = this.tail = null;
      if (operationStep !== null) {
        operationStep.operation.teardownHead = operationStep.operation.teardownTail = null;
      }
      this._isBindingDone = false;
      this.isBound = false;
      const step = this._operation;
      // Delay settlement until _completeDeactivation has decided whether the
      // latest desired state requires a queued successor activation.
      this.unbind(false);
      if (step !== null) {
        this._completeDeactivation(step);
      }
    }
  }

  /** @internal */
  private _completeDeactivation(step: ControllerStep): void {
    const operation = step.operation;
    const successor = operation.desired;
    if (successor.active && getOperationError(step) === void 0) {
      // The successor must receive a fresh operation identity, but callers of
      // the superseded transition keep waiting until that successor settles.
      this._operation = null;
      operation.mode = 'settled';
      let result: void | Promise<void>;
      try {
        result = this.activate(
          successor.initiator as IHydratedController,
          successor.parent as IHydratedController | null,
          successor.scope,
        );
      } catch (error) {
        recordStepError(step, reserveLifecycleParticipant(), error);
        this._settleDetachedOperation(step);
        return;
      }
      if (isPromise(result)) {
        // The successor owns its own drain. Both reactions settle the detached
        // predecessor deferred, so the ignored derived Promise cannot reject.
        void result.then(
          () => this._settleDetachedOperation(step),
          error => {
            recordStepError(step, reserveLifecycleParticipant(), error);
            this._settleDetachedOperation(step);
          },
        );
      } else {
        this._settleDetachedOperation(step);
      }
      return;
    }
    this._resolve();
  }

  /** @internal */
  private _settleDetachedOperation(step: ControllerStep): void {
    // `_completeDeactivation` detached this step before successor activation so
    // the successor could acquire fresh identity. `_settleStep` would clear the
    // successor's current identity/counters instead of only settling this old drain.
    const deferred = step.result;
    const error = getOperationError(step);
    if (deferred !== void 0) {
      if (error === void 0) {
        deferred.resolve();
      } else {
        deferred.reject(error.error);
      }
    }
  }

  public addBinding(binding: IBinding): void {
    if (this.bindings === null) {
      this.bindings = [binding];
    } else {
      this.bindings[this.bindings.length] = binding;
    }
  }

  /**
   * Adds a binding that must run before bindings already rendered for this
   * controller.
   *
   * @internal
   */
  public prependBinding(binding: IBinding): void {
    const bindings = this.bindings;
    if (bindings === null) {
      this.addBinding(binding);
    } else {
      bindings.unshift(binding);
    }
  }

  public addChild(controller: Controller): void {
    if (this.children === null) {
      this.children = [controller];
    } else {
      this.children[this.children.length] = controller;
    }
  }

  public is(name: string): boolean {
    switch (this.vmKind) {
      case vmkCa:
      case vmkCe: {
        return (this.definition as ResourceDefinition).name === name;
      }
      case vmkSynth:
        return this.viewFactory!.name === name;
    }
  }

  public setHost(host: HTMLElement): this {
    if (this.vmKind === vmkCe) {
      setRef(host, elementBaseName, this as IHydratedController);
      setRef(host, this.definition!.key, this as IHydratedController);
    }
    this.host = host;
    this.mountTarget = targetHost;
    return this;
  }

  public setShadowRoot(shadowRoot: ShadowRoot): this {
    if (this.vmKind === vmkCe) {
      setRef(shadowRoot, elementBaseName, this as IHydratedController);
      setRef(shadowRoot, this.definition!.key, this as IHydratedController);
    }
    this.shadowRoot = shadowRoot;
    this.mountTarget = targetShadowRoot;
    return this;
  }

  public setLocation(location: IRenderLocation): this {
    if (this.vmKind === vmkCe) {
      setRef(location, elementBaseName, this as IHydratedController);
      setRef(location, this.definition!.key, this as IHydratedController);
    }
    this.location = location;
    this.mountTarget = targetLocation;
    return this;
  }

  public release(): void {
    this.state |= released;
  }

  public dispose(): void {
    if ((this.state & disposed) === disposed) {
      return;
    }
    this._assertDisposableSubtree();
    this._disposeCore();
  }

  /**
   * Dispose as soon as the controller's current transition or compensation
   * reaches its local cleanup boundary. Dynamic owners use this after initiating
   * descendant teardown because an ancestor-driven deactivate call intentionally
   * does not expose the ancestor's drain.
   *
   * @internal
   */
  public _disposeAfterDeactivate(): void {
    const state = this.state & ~released;
    if (state === activating || state === deactivating) {
      const initiator = this.$initiator as Controller;
      const step = this._operation ?? this._ensureStep(
        state === activating ? 'activate' : 'deactivate',
        initiator,
        this.parent as Controller | null,
      );
      step.operation.desired = {
        active: false,
        initiator: step.operation.initiator,
        parent: step.operation.desired.parent,
      };
      step.disposeRequested = true;
      return;
    }
    this.dispose();
  }

  /** @internal */
  private _assertDisposableSubtree(): void {
    // accept() includes both structural children and controllers exposed by
    // dynamic owners such as Repeat, Switch, Promise, and AuCompose.
    let running = false;
    this.accept(controller => {
      const candidate = controller as Controller;
      if (candidate._operation !== null && candidate._operation.operation.mode !== 'settled') {
        running = true;
        return true;
      }
      return;
    });
    if (running) {
      throw createMappedError(ErrorNames.controller_dispose_active_operation, this.name);
    }
  }

  /** @internal */
  private _disposeCore(): void {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`dispose()`); }

    if ((this.state & disposed) === disposed) {
      return;
    }
    // Mark first so re-entrant disposal callbacks remain idempotent even when a
    // later resolver or child cleanup throws.
    this.state |= disposed;

    let firstError: unknown;
    let hasError = false;
    const step = this._operation;
    const capture = (order: number, error: unknown): void => {
      // A live operation owns every cleanup failure. Outside an operation we
      // still finish best-effort disposal and synchronously throw the first.
      if (step !== null) {
        this._recordOperationError(step, order, error);
      } else if (!hasError) {
        hasError = true;
        firstError = error;
      }
    };

    if (this._vmHooks._dispose) {
      try {
        this._vm!.dispose();
      } catch (error) {
        capture(reserveLifecycleParticipant(), error);
      }
    }

    if (this.children !== null) {
      for (let i = 0; i < this.children.length; ++i) {
        try {
          this.children[i]._disposeCore();
        } catch (error) {
          capture(reserveLifecycleParticipant(), error);
        }
      }
      this.children = null;
    }

    this.scope = null;

    this.nodes = null;
    this.location = null;

    this.viewFactory = null;
    if (this._vm !== null) {
      controllerLookup.delete(this._vm);
    }
    this._vm = null;
    this.host = null;
    this.shadowRoot = null;
    try {
      this.container.disposeResolvers();
    } catch (error) {
      capture(reserveLifecycleParticipant(), error);
    }
    if (hasError) {
      throw firstError;
    }
  }

  public accept(visitor: ControllerVisitor): void | true {
    let visited = activeControllerVisitors.get(visitor);
    const ownsTraversal = visited === void 0;
    if (ownsTraversal) {
      activeControllerVisitors.set(visitor, visited = new Set());
    } else if (visited!.has(this)) {
      // Dynamic owners can expose controllers that also occur in the static
      // child tree. A visitor-level seen set makes that ownership graph safe.
      return;
    }
    visited!.add(this);

    try {
      if (visitor(this as IHydratedController) === true) {
        return true;
      }

      if (this._vmHooks._accept && this._vm!.accept(visitor) === true) {
        return true;
      }

      if (this.children !== null) {
        const { children } = this;
        for (let i = 0, ii = children.length; i < ii; ++i) {
          if (children[i].accept(visitor) === true) {
            return true;
          }
        }
      }
    } finally {
      if (ownsTraversal) {
        activeControllerVisitors.delete(visitor);
      }
    }
  }
}

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
const activeControllerVisitors: WeakMap<ControllerVisitor, Set<Controller>> = new WeakMap();

export type ControllerBindingContext<C extends IViewModel> = Required<ICompileHooks> & Required<IActivationHooks<IHydratedController | null>> & C;

const targetNone = 0;
const targetHost = 1;
const targetShadowRoot = 2;
const targetLocation = 3;

/**
 * Describes the type of the host node/location of a controller
 * - `none` / 1:       no host
 * - `host` / 2:       an HTML element is the host of a controller
 * - `shadowRoot` / 3: a shadow root is the host of a controller
 * - `location` / 4:   a render location is the location of a controller, this is often used for template controllers
 */
export const MountTarget = objectFreeze({
  none: targetNone,
  host: targetHost,
  shadowRoot: targetShadowRoot,
  location: targetLocation,
});
export type MountTarget = typeof MountTarget[keyof typeof MountTarget];

// const optionalCeFind = { optional: true } as const;
const optionalCoercionConfigResolver = optionalResource(ICoercionConfiguration);

function createObservers(
  controller: Controller,
  definition: CustomElementDefinition | CustomAttributeDefinition,
  instance: IIndexable<ICustomElementViewModel | ICustomAttributeViewModel>,
): void {
  const bindables = definition.bindables;
  const observableNames = getOwnPropertyNames(bindables);
  const length = observableNames.length;

  if (length === 0) return;

  const locator = controller.container.get(IObserverLocator);
  const hasAggregatedCallbacks = 'propertiesChanged' in instance;
  const coercion = controller.vmKind === vmkSynth
    ? void 0
    : controller.container.get(optionalCoercionConfigResolver);

  const queueCallback = hasAggregatedCallbacks
    ? (() => {
        let changes: Record<string, { newValue: unknown; oldValue: unknown }> = {};
        let isQueued = false;
        let changeCount = 0;
        const callPropertiesChanged = () => {
          if (!isQueued) {
            isQueued = true;
            queueTask(() => {
              isQueued = false;
              const $changes = changes;
              changes = {};
              changeCount = 0;
              if (controller.isBound) {
                instance.propertiesChanged?.($changes);
                if (changeCount > 0) {
                  callPropertiesChanged();
                }
              }
            });
          }
        };

        return (key: string, newValue: unknown, oldValue: unknown) => {
          changes[key] = { newValue, oldValue };
          changeCount++;
          callPropertiesChanged();
        };
    })()
    : noop;

  for (let i = 0; i < length; ++i) {
    const name = observableNames[i];
    const bindable = bindables[name];
    const handler = bindable.callback;
    const obs = locator.getObserver(instance, name);

    if (bindable.set !== noop) {
      if (obs.useCoercer?.(bindable.set, coercion) !== true) {
        throw createMappedError(ErrorNames.controller_property_not_coercible, name);
      }
    }
    if (handler in instance
      || instance.propertyChanged != null
      || hasAggregatedCallbacks
    ) {
      const callback = (newValue: unknown, oldValue: unknown) => {
        if (controller.isBound) {
          (instance[handler] as AnyFunction)?.(newValue, oldValue);
          instance.propertyChanged?.(name, newValue, oldValue);
          queueCallback(name, newValue, oldValue);
        }
      };
      if (obs.useCallback?.(callback) !== true) {
        throw createMappedError(ErrorNames.controller_property_no_change_handler, name);
      }
    }
  }
}

const AccessScopeAstMap = new Map<PropertyKey, AccessScopeExpression>();
const getAccessScopeAst = (key: PropertyKey) => {
  let ast = AccessScopeAstMap.get(key);
  if (ast == null) {
    ast = createAccessScopeExpression(key as string, 0);
    AccessScopeAstMap.set(key, ast);
  }
  return ast;
};

function createWatchers(
  controller: Controller,
  context: IServiceLocator,
  definition: CustomElementDefinition | CustomAttributeDefinition,
  instance: object,
) {
  const observerLocator = context!.get(IObserverLocator);
  const expressionParser = context.get(IExpressionParser);
  const watches = definition.watches;
  const scope: Scope = controller.vmKind === vmkCe
    ? controller.scope!
    // custom attribute does not have own scope
    : Scope.create(instance, null, true);
  const ii = watches.length;
  let expression: IWatchDefinition['expression'];
  let callback: IWatchDefinition['callback'];
  let ast: IsBindingBehavior;
  let flush: 'async' | 'sync' | undefined;
  let i = 0;

  for (; ii > i; ++i) {
    ({ expression, callback, flush } = watches[i]);
    callback = isFunction(callback)
      ? callback
      : Reflect.get(instance, callback) as IWatcherCallback<object>;
    if (!isFunction(callback)) {
      throw createMappedError(ErrorNames.controller_watch_invalid_callback, callback);
    }
    if (isFunction(expression)) {
      controller.addBinding(new ComputedWatcher(
        instance as IObservable,
        observerLocator,
        expression,
        callback,
        flush,
      ));
    } else {
      ast = isString(expression)
        ? expressionParser.parse(expression, etIsProperty)
        : getAccessScopeAst(expression);

      controller.addBinding(new ExpressionWatcher(
        scope,
        context,
        observerLocator,
        ast,
        callback,
        flush,
      ) as unknown as IBinding);
    }
  }
}

export function isCustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel>(value: unknown): value is ICustomElementController<C> {
  return value instanceof Controller && value.vmKind === vmkCe;
}

export function isCustomElementViewModel(value: unknown): value is ICustomElementViewModel {
  return isElementType(value?.constructor);
}

class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly _hydrating: boolean;
  public readonly _hydrated: boolean;
  public readonly _created: boolean;

  public readonly _binding: boolean;
  public readonly _bound: boolean;
  public readonly _attaching: boolean;
  public readonly _attached: boolean;

  public readonly _detaching: boolean;
  public readonly _unbinding: boolean;

  public readonly _dispose: boolean;
  public readonly _accept: boolean;

  public constructor(target: object) {
    this._hydrating = 'hydrating' in target;
    this._hydrated = 'hydrated' in target;
    this._created = 'created' in target;

    this._binding = 'binding' in target;
    this._bound = 'bound' in target;
    this._attaching = 'attaching' in target;
    this._attached = 'attached' in target;

    this._detaching = 'detaching' in target;
    this._unbinding = 'unbinding' in target;

    this._dispose = 'dispose' in target;
    this._accept = 'accept' in target;
  }
}

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

/** @internal */ export const vmkCe = 'customElement' as const;
/** @internal */ export const vmkCa = 'customAttribute' as const;
const vmkSynth = 'synthetic' as const;
export type ViewModelKind = typeof vmkCe | typeof vmkCa | typeof vmkSynth;

/**
 * A controller that is ready for activation. It can be `ISyntheticView`, `ICustomElementController` or `ICustomAttributeController`.
 *
 * In terms of specificity this is identical to `IController`. The only difference is that this
 * type is further initialized and thus has more properties and APIs available.
 */
export type IHydratedController = ISyntheticView | ICustomElementController | ICustomAttributeController;
/**
 * A controller that is ready for activation. It can be `ICustomElementController` or `ICustomAttributeController`.
 *
 * This type of controller is backed by a real component (hence the name) and therefore has ViewModel and may have lifecycle hooks.
 *
 * In contrast, `ISyntheticView` has neither a view model nor lifecycle hooks (but its child controllers, if any, may).
 */
export type IHydratedComponentController = ICustomElementController | ICustomAttributeController;
/**
 * A controller that is ready for activation. It can be `ISyntheticView` or `ICustomElementController`.
 *
 * This type of controller may have child controllers (hence the name) and bindings directly placed on it during hydration.
 *
 * In contrast, `ICustomAttributeController` has neither child controllers nor bindings directly placed on it (but the backing component may).
 *
 * Note: the parent of a `ISyntheticView` is always a `IHydratedComponentController` because views cannot directly own other views. Views may own components, and components may own views or components.
 */
export type IHydratedParentController = ISyntheticView | ICustomElementController;

/**
 * A callback that is invoked on each controller in the component tree.
 *
 * Return `true` to stop traversal.
 */
export type ControllerVisitor = (controller: IHydratedController) => void | true;

/**
 * The base type for all controller types.
 *
 * Every controller, regardless of their type and state, will have at least the properties/methods in this interface.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IController<C extends IViewModel = IViewModel> extends IDisposable {
  /**
   * The container associated with this controller.
   * By default, CE should have their own container while custom attribute & synthetic view
   * will use the parent container one, since they do not need to manage one
   */
  readonly name: string;
  readonly container: IContainer;
  readonly vmKind: ViewModelKind;
  readonly definition: CustomElementDefinition | CustomAttributeDefinition | null;
  readonly host: HTMLElement | null;
  readonly state: State;
  readonly isActive: boolean;
  /**
   * Whether the initiator operation is compensating a failed activation.
   * Dynamic owners use this to avoid awaiting the activation drain that caused
   * the compensation.
   *
   * @internal
   */
  readonly isActivationRollback: boolean;
  readonly parent: IHydratedController | null;
  readonly isBound: boolean;
  readonly bindings: readonly IBinding[] | null;

  addBinding(binding: IBinding): void;
  /** @internal */ prependBinding(binding: IBinding): void;

  /** @internal */head: IHydratedController | null;
  /** @internal */tail: IHydratedController | null;
  /** @internal */next: IHydratedController | null;

  /**
   * Return `true` to stop traversal.
   */
  accept(visitor: ControllerVisitor): void | true;
}

/**
 * The base type for `ICustomAttributeController` and `ICustomElementController`.
 *
 * Both of those types have the `viewModel` property which represent the user instance containing the bound properties and hooks for this component.
 */
export interface IComponentController<C extends IViewModel = IViewModel> extends IController<C> {
  readonly vmKind: 'customAttribute' | 'customElement';
  readonly definition: CustomElementDefinition | CustomAttributeDefinition;

  /**
   * The user instance containing the bound properties. This is always an instance of a class, which may either be user-defined, or generated by a view locator.
   */
  readonly viewModel: C;
}

/**
 * The base type for `ISyntheticView` and `ICustomElementController`.
 *
 * Both of those types can:
 * - Have `children` which are populated during hydration (hence, 'Hydratable').
 * - Have physical DOM nodes that can be mounted.
 */
export interface IHydratableController<C extends IViewModel = IViewModel> extends IController<C> {
  readonly vmKind: 'customElement' | 'synthetic';
  readonly mountTarget: MountTarget;
  readonly definition: CustomElementDefinition | null;
  readonly strict: boolean | undefined | null;

  readonly children: readonly IHydratedController[] | null;

  /**
   * SSR manifest scope for tree-based hydration.
   * Set during controller creation, consumed by TCs in attaching().
   */
  ssrScope?: ISSRScopeChild;

  addChild(controller: IController): void;
}

/** @internal */ export const none         = 0b00_00_00;
/** @internal */ export const activating   = 0b00_00_01;
/** @internal */ export const activated    = 0b00_00_10;
/** @internal */ export const deactivating = 0b00_01_00;
/** @internal */ export const deactivated  = 0b00_10_00;
/** @internal */ export const released     = 0b01_00_00;
/** @internal */ export const disposed     = 0b10_00_00;

export const State = /*@__PURE__*/ objectFreeze({
  none,
  activating,
  activated,
  deactivating,
  deactivated,
  released,
  disposed,
});
export type State = typeof State[keyof typeof State];

export function stringifyState(state: State): string {
  const names: string[] = [];

  if ((state & activating) === activating) { names.push('activating'); }
  if ((state & activated) === activated) { names.push('activated'); }
  if ((state & deactivating) === deactivating) { names.push('deactivating'); }
  if ((state & deactivated) === deactivated) { names.push('deactivated'); }
  if ((state & released) === released) { names.push('released'); }
  if ((state & disposed) === disposed) { names.push('disposed'); }

  return names.length === 0 ? 'none' : names.join('|');
}

/**
 * The controller for a synthetic view, that is, a controller created by an `IViewFactory`.
 *
 * A synthetic view, typically created when composing a template controller (`if`, `repeat`, etc), is a hydratable component with mountable DOM nodes that has no user view model.
 *
 * It has either its own synthetic binding context or is locked to some externally sourced scope (in the case of `au-compose`)
 */
export interface ISyntheticView extends IHydratableController {
  readonly vmKind: 'synthetic';
  readonly definition: null;
  readonly viewModel: null;
  /**
   * The physical DOM nodes that will be appended during the attach operation.
   */
  readonly nodes: INodeSequence;

  activate(
    initiator: IHydratedController,
    parent: IHydratedController,
    scope: Scope,
  ): void | Promise<void>;
  deactivate(
    initiator: IHydratedController,
    parent: IHydratedController,
  ): void | Promise<void>;
  /**
   * The scope that belongs to this view. This property will always be defined when the `state` property of this view indicates that the view is currently bound.
   *
   * The `scope` may be set during `activate()` and unset during `deactivate()`
   */
  readonly scope: Scope;

  /**
   * Set the render location that this view will be inserted before.
   */
  setLocation(location: IRenderLocation): this;
  /**
   * The DOM node that this view will be inserted before (if set).
   */
  readonly location: IRenderLocation | null;

  /**
   * Set the host that this view will be appended to.
   */
  setHost(host: Node & ParentNode): this;
  /**
   * The DOM node that this view will be appended to (if set).
   */
  readonly host: HTMLElement | null;

  /**
   * Set the `ShadowRoot` that this view will be appended to.
   */
  setShadowRoot(shadowRoot: ShadowRoot): this;
  /**
   * The ShadowRoot that this view will be appended to (if set).
   */
  readonly shadowRoot: ShadowRoot | null;

  /**
   * Mark this view as not-in-use, so that it can either be disposed or returned to cache after finishing the deactivate lifecycle.
   *
   * If this view is cached and later retrieved from the cache, it will be marked as in-use again before starting the activate lifecycle, so this method must be called each time.
   *
   * If this method is *not* called before `deactivate()`, this view will neither be cached nor disposed.
   */
  release(): void;
}

export interface ICustomAttributeController<C extends ICustomAttributeViewModel = ICustomAttributeViewModel> extends IComponentController<C> {
  readonly vmKind: 'customAttribute';
  readonly definition: CustomAttributeDefinition;
  /**
   * @inheritdoc
   */
  readonly viewModel: C;
  readonly lifecycleHooks: LifecycleHooksLookup;
  /**
   * The scope that belongs to this custom attribute. This property will always be defined when the `state` property of this view indicates that the view is currently bound.
   *
   * The `scope` will be set during `activate()` and unset during `deactivate()`.
   *
   * The scope's `bindingContext` will be the same instance as this controller's `viewModel` property.
   */
  readonly scope: Scope;
  readonly children: null;
  readonly bindings: null;
  /**
   * SSR manifest scope for template controllers during hydration.
   * Contains views array for repeat, if/else branches, etc.
   * Set during hydration, consumed once in attaching().
   */
  ssrScope?: ISSRScopeChild;
  activate(
    initiator: IHydratedController,
    parent: IHydratedController,
    scope: Scope,
  ): void | Promise<void>;
  deactivate(
    initiator: IHydratedController,
    parent: IHydratedController,
  ): void | Promise<void>;
}

/**
 * A representation of `IController` specific to a custom element before it is hydrated.
 *
 * It is not yet hydrated (hence 'dry') with any render-specific information.
 */
export interface IDryCustomElementController<C extends IViewModel = IViewModel> extends IComponentController<C>, IHydratableController<C> {
  readonly vmKind: 'customElement';
  readonly definition: CustomElementDefinition;
  readonly strict: boolean | undefined | null;
  /**
   * The scope that belongs to this custom element. This property is set immediately after the controller is created and is always guaranteed to be available.
   *
   * It may be overwritten by end user during the `hydrating()` hook.
   *
   * By default, the scope's `bindingContext` will be the same instance as this controller's `viewModel` property.
   */
  scope: Scope;
  /**
   * The original host dom node.
   *
   * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
   *
   * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
   */
  readonly host: HTMLElement;
}

/**
 * A representation of `IController` specific to a custom element whose `hydrating` hook is about to be invoked (if present).
 *
 * It has the same properties as `IDryCustomElementController`, as well as a render context (hence 'contextual').
 */
export interface IContextualCustomElementController<C extends IViewModel = IViewModel> extends IDryCustomElementController<C> {

}

/**
 * A representation of `IController` specific to a custom element whose `hydrated` hook is about to be invoked (if present).
 *
 * It has the same properties as `IContextualCustomElementController`, except the context is now compiled (hence 'compiled'), as well as the nodes, and projector.
 */
export interface ICompiledCustomElementController<C extends IViewModel = IViewModel> extends IContextualCustomElementController<C> {
  /**
   * The ShadowRoot, if this custom element uses ShadowDOM.
   */
  readonly shadowRoot: ShadowRoot | null;
  /**
   * The renderLocation, if this is a `containerless` custom element.
   */
  readonly location: IRenderLocation | null;
  /**
   * The physical DOM nodes that will be appended during the `mount()` operation.
   */
  readonly nodes: INodeSequence;
}

/**
 * A fully hydrated custom element controller.
 */
export interface ICustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel> extends ICompiledCustomElementController<C> {
  /**
   * @inheritdoc
   */
  readonly viewModel: C;
  readonly lifecycleHooks: LifecycleHooksLookup;

  activate(
    initiator: IHydratedController,
    parent: IHydratedController | null,
    scope?: Scope,
  ): void | Promise<void>;
  deactivate(
    initiator: IHydratedController,
    parent: IHydratedController | null,
  ): void | Promise<void>;
}

export const IController = /*@__PURE__*/createInterface<IController>('IController');

export const IHydrationContext = /*@__PURE__*/createInterface<IHydrationContext>('IHydrationContext');
export interface IHydrationContext<T extends ICustomElementViewModel = ICustomElementViewModel> {
  readonly controller: ICustomElementController<T>;
  readonly instruction: IControllerElementHydrationInstruction | null;
  readonly parent: IHydrationContext | undefined;
}

/** @internal */
export class HydrationContext<T extends ICustomElementViewModel> implements IHydrationContext<T> {
  public readonly controller: ICustomElementController<T>;
  public constructor(
    controller: ICustomElementController,
    public readonly instruction: IControllerElementHydrationInstruction | null,
    public readonly parent: IHydrationContext | undefined,
  ) {
    this.controller = controller as ICustomElementController<T>;
  }
}

export interface IActivationHooks<TParent> {
  binding?(
    initiator: IHydratedController,
    parent: TParent,
  ): void | Promise<void>;
  bound?(
    initiator: IHydratedController,
    parent: TParent,
  ): void | Promise<void>;
  attaching?(
    initiator: IHydratedController,
    parent: TParent,
  ): void | Promise<void>;
  attached?(
    initiator: IHydratedController,
  ): void | Promise<void>;

  detaching?(
    initiator: IHydratedController,
    parent: TParent,
  ): void | Promise<void>;
  unbinding?(
    initiator: IHydratedController,
    parent: TParent,
  ): void | Promise<void>;

  dispose?(): void;
  /**
   * If this component controls the instantiation and lifecycles of one or more controllers,
   * implement this hook to expose those controllers to framework traversal. This is used by
   * router integrations and by lifecycle/disposal safety checks; omitting an owned controller
   * can allow its owner to be disposed while that controller still has live lifecycle work.
   *
   * Return `true` to stop traversal.
   */
  accept?(visitor: ControllerVisitor): void | true;
}

export interface ICompileHooks {
  hydrating?(
    controller: IContextualCustomElementController<this>,
  ): void;
  hydrated?(
    controller: ICompiledCustomElementController<this>,
  ): void;
  created?(
    controller: ICustomElementController<this> | ICustomAttributeController<this>,
  ): void;
}

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface IViewModel {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor: Function;
  readonly $controller?: IController<this>;
}

export interface ICustomElementViewModel extends IViewModel, IActivationHooks<IHydratedController | null>, ICompileHooks {
  readonly $controller?: ICustomElementController<this>;
  created?(
    controller: ICustomElementController<this>,
  ): void;
  propertyChanged?(key: PropertyKey, newValue: unknown, oldValue: unknown): void;
  propertiesChanged?(changes: Record<string, { newValue: unknown; oldValue: unknown }>): void;
}

export interface ICustomAttributeViewModel extends IViewModel, IActivationHooks<IHydratedController> {
  readonly $controller?: ICustomAttributeController<this>;
  link?(
    controller: IHydratableController,
    childController: ICustomAttributeController,
    target: INode,
    instruction: IInstruction,
  ): void;
  created?(
    controller: ICustomAttributeController<this>,
  ): void;
  propertyChanged?(key: PropertyKey, newValue: unknown, oldValue: unknown): void;
  propertiesChanged?(changes: Record<string, { newValue: unknown; oldValue: unknown }>): void;
}

export interface IHydratedCustomElementViewModel extends ICustomElementViewModel {
  readonly $controller: ICustomElementController<this>;
}

export interface IHydratedCustomAttributeViewModel extends ICustomAttributeViewModel {
  readonly $controller: ICustomAttributeController<this>;
}

export interface IControllerElementHydrationInstruction {
  /**
   * An internal mechanism to defer controller hydration.
   *
   * When `false`, the controller is created without being hydrated immediately.
   *
   * @internal
   */
  readonly hydrate?: boolean;
  readonly projections: Record<string, PartialCustomElementDefinition> | null;
  /**
   * A list of captured attributes/binding in raw format
   */
  readonly captures?: AttrSyntax[];
  /**
   * Indicates whether the custom element was used with "containerless" attribute
   */
  readonly containerless?: boolean;
}

function callCreatedHook(this: Controller, l: LifecycleHooksEntry<ICompileHooks, 'created'>) {
  l.instance.created(this._vm!, this as IHydratedComponentController);
}

function callHydratingHook(this: Controller, l: LifecycleHooksEntry<ICompileHooks, 'hydrating'>) {
  l.instance.hydrating(this._vm!, this as IContextualCustomElementController<ICompileHooks>);
}

function callHydratedHook(this: Controller, l: LifecycleHooksEntry<ICompileHooks, 'hydrated'>) {
  l.instance.hydrated(this._vm!, this as ICompiledCustomElementController<ICompileHooks>);
}

const setRef = refs.set;
