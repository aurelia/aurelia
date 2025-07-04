/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  AnyFunction,
  IIndexable,
  ILogger,
  InstanceProvider,
  LogLevel,
  noop,
  onResolve,
  onResolveAll,
  optional,
  optionalResource,
  isFunction,
  isPromise,
  isString,
} from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior, AccessScopeExpression } from '@aurelia/expression-parser';
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

  public hasLockedScope: boolean = false;

  public scope: Scope | null = null;
  public isBound: boolean = false;
  /** @internal */
  private _isBindingDone: boolean = false;

  public mountTarget: MountTarget = targetNone;
  public shadowRoot: ShadowRoot | null = null;
  public nodes: INodeSequence | null = null;
  public location: IRenderLocation | null = null;

  /** @internal */
  public _lifecycleHooks: LifecycleHooksLookup<ICompileHooks & IActivationHooks<IHydratedController>> | null = null;
  public get lifecycleHooks(): LifecycleHooksLookup<ICompileHooks & IActivationHooks<IHydratedController>> | null {
    return this._lifecycleHooks;
  }

  public state: State = none;

  public get isActive(): boolean {
    return (this.state & (activating | activated)) > 0 && (this.state & deactivating) === 0;
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

    controller._hydrateCustomAttribute();

    return controller as unknown as ICustomAttributeController<C>;
  }

  /**
   * Create a synthetic view (controller) for a given factory
   *
   * @param viewFactory - todo(comment)
   * @param flags - todo(comment)
   * @param parentController - the parent controller to connect the created view with. Used in activation
   *
   * Semi private API
   */
  public static $view(
    viewFactory: IViewFactory,
    parentController: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined = void 0,
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

    controller._hydrateSynthetic();

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
    this.nodes = this._rendering.createNodes(compiledDef);

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
    this._rendering.render(
      /* controller */this as ICustomElementController,
      /* targets    */this.nodes!.findTargets(),
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
      /* host       */void 0,
    );
  }

  private $initiator: IHydratedController = null!;
  public activate(
    initiator: IHydratedController,
    parent: IHydratedController | null,
    scope?: Scope | null,
  ): void | Promise<void> {
    switch (this.state) {
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

        if (!this.hasLockedScope) {
          this.scope = scope;
        }
        break;
    }

    this.$initiator = initiator;

    // opposing leave is called in attach() (which will trigger attached())
    this._enterActivating();

    let ret: void | Promise<void> = void 0;
    if (this.vmKind !== vmkSynth && this._lifecycleHooks!.binding != null) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`lifecycleHooks.binding()`); }

      ret = onResolveAll(...this._lifecycleHooks!.binding!.map(callBindingHook, this));
    }

    if (this._vmHooks._binding) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`binding()`); }

      ret = onResolveAll(ret, this._vm!.binding(this.$initiator, this.parent));
    }

    if (isPromise(ret)) {
      this._ensurePromise();
      ret.then(() => {
        this._isBindingDone = true;
        if (this.state !== activating) {
          // because controller can be deactivated, during a long running promise in the binding phase
          this._leaveActivating();
        } else {
          this.bind();
        }
      }).catch((err: Error) => {
        this._reject(err);
      });
      return this.$promise;
    }

    this._isBindingDone = true;
    this.bind();
    return this.$promise;
  }

  private bind(): void {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`bind()`); }

    let i = 0;
    let ii = 0;
    let ret: void | Promise<void> = void 0;

    if (this.bindings !== null) {
      i = 0;
      ii = this.bindings.length;
      while (ii > i) {
        this.bindings[i].bind(this.scope!);
        ++i;
      }
    }

    if (this.vmKind !== vmkSynth && this._lifecycleHooks!.bound != null) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`lifecycleHooks.bound()`); }

      ret = onResolveAll(...this._lifecycleHooks!.bound.map(callBoundHook, this));
    }

    if (this._vmHooks._bound) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`bound()`); }

      ret = onResolveAll(ret, this._vm!.bound(this.$initiator, this.parent));
    }

    if (isPromise(ret)) {
      this._ensurePromise();
      ret.then(() => {
        this.isBound = true;
        // because controller can be deactivated, during a long running promise in the bound phase
        if (this.state !== activating) {
          this._leaveActivating();
        } else {
          this._attach();
        }
      }).catch((err: Error) => {
        this._reject(err);
      });
      return;
    }

    this.isBound = true;
    this._attach();
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
  private _attach(): void {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`attach()`); }

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

    let i = 0;
    let ret: Promise<void> | void = void 0;

    if (this.vmKind !== vmkSynth && this._lifecycleHooks!.attaching != null) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`lifecycleHooks.attaching()`); }

      ret = onResolveAll(...this._lifecycleHooks!.attaching!.map(callAttachingHook, this));
    }

    if (this._vmHooks._attaching) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`attaching()`); }

      ret = onResolveAll(ret, this._vm!.attaching(this.$initiator, this.parent));
    }

    if (isPromise(ret)) {
      this._ensurePromise();
      this._enterActivating();
      ret.then(() => {
        this._leaveActivating();
      }).catch((err: Error) => {
        this._reject(err);
      });
    }

    // attaching() and child activation run in parallel, and attached() is called when both are finished
    if (this.children !== null) {
      for (; i < this.children.length; ++i) {
        // Any promises returned from child activation are cumulatively awaited before this.$promise resolves
        void this.children[i].activate(this.$initiator, this as IHydratedController, this.scope);
      }
    }

    // attached() is invoked by Controller#leaveActivating when `activatingStack` reaches 0
    this._leaveActivating();
  }

  public deactivate(
    initiator: IHydratedController,
    _parent: IHydratedController | null,
  ): void | Promise<void> {
    let prevActivation: void | Promise<void> = void 0;
    switch ((this.state & ~released)) {
      case activated:
        this.state = deactivating;
        break;
      case activating:
        this.state = deactivating;
        // we are about to deactivate, the error from activation can be ignored
        prevActivation = this.$promise?.catch(__DEV__
          /* istanbul-ignore-next */
          ? err => {
            this.logger.warn('The activation error will be ignored, as the controller is already scheduled for deactivation. The activation was rejected with: %s', err);
          }
          : noop);
        break;
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

    this.$initiator = initiator;

    if (initiator === this) {
      this._enterDetaching();
    }

    let i = 0;
    let ret: void | Promise<void>;

    if (this.children !== null) {
      for (i = 0; i < this.children.length; ++i) {
        // Child promise results are tracked by enter/leave combo's
        void this.children[i].deactivate(initiator, this as IHydratedController);
      }
    }

    return onResolve(prevActivation, () => {
      if (this.isBound) {
        if (this.vmKind !== vmkSynth && this._lifecycleHooks!.detaching != null) {
          if (__DEV__ && this.debug) { this.logger!.trace(`lifecycleHooks.detaching()`); }

          ret = onResolveAll(...this._lifecycleHooks!.detaching.map(callDetachingHook, this));
        }

        if (this._vmHooks._detaching) {
          if (__DEV__ && this.debug) { this.logger!.trace(`detaching()`); }

          ret = onResolveAll(ret, this._vm!.detaching(this.$initiator, this.parent));
        }
      }

      if (isPromise(ret)) {
        this._ensurePromise();
        (initiator as Controller)._enterDetaching();
        ret.then(() => {
          (initiator as Controller)._leaveDetaching();
        }).catch((err: Error) => {
          (initiator as Controller)._reject(err);
        });
      }

      // Note: if a 3rd party plugin happens to do any async stuff in a template controller before calling deactivate on its view,
      // then the linking will become out of order.
      // For framework components, this shouldn't cause issues.
      // We can only prevent that by linking up after awaiting the detaching promise, which would add an extra tick + a fair bit of
      // overhead on this hot path, so it's (for now) a deliberate choice to not account for such situation.
      // Just leaving the note here so that we know to look here if a weird detaching-related timing issue is ever reported.
      if (initiator.head === null) {
        initiator.head = this as IHydratedController;
      } else {
        initiator.tail!.next = this as IHydratedController;
      }
      initiator.tail = this as IHydratedController;

      if (initiator !== this) {
        // Only detaching is called + the linked list is built when any controller that is not the initiator, is deactivated.
        // The rest is handled by the initiator.
        // This means that descendant controllers have to make sure to await the initiator's promise before doing any subsequent
        // controller api calls, or race conditions might occur.
        return;
      }

      this._leaveDetaching();
      return this.$promise;
    });
  }

  private removeNodes(): void {
    switch (this.vmKind) {
      case vmkCe:
      case vmkSynth:
        this.nodes!.remove();
        this.nodes!.unlink();
    }
  }

  private unbind(): void {
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`unbind()`); }

    let i = 0;

    if (this.bindings !== null) {
      for (; i < this.bindings.length; ++i) {
        this.bindings[i].unbind();
      }
    }

    this.parent = null;

    switch (this.vmKind) {
      case vmkCa:
        this.scope = null;
        break;
      case vmkSynth:
        if (!this.hasLockedScope) {
          this.scope = null;
        }

        if (
          (this.state & released) === released &&
          !this.viewFactory!.tryReturnToCache(this as ISyntheticView) &&
          this.$initiator === this
        ) {
          this.dispose();
        }
        break;
      case vmkCe:
        (this.scope as Writable<Scope>).parent = null;
        break;
    }

    this.state = deactivated;
    this.$initiator = null!;
    this._resolve();
  }

  private $resolve: (() => void) | undefined = void 0;
  private $reject: ((err: unknown) => void) | undefined = void 0;
  private $promise: Promise<void> | undefined = void 0;

  /** @internal */
  private _ensurePromise(): void {
    if (this.$promise === void 0) {
      this.$promise = new Promise((resolve, reject) => {
        this.$resolve = resolve;
        this.$reject = reject;
      });
      if (this.$initiator !== this) {
        (this.parent as Controller)._ensurePromise();
      }
    }
  }

  /** @internal */
  private _resolve(): void {
    if (this.$promise !== void 0) {
      _resolve = this.$resolve!;
      this.$resolve = this.$reject = this.$promise = void 0;
      _resolve();
      _resolve = void 0;
    }
  }

  /** @internal */
  private _reject(err: Error): void {
    if (this.$promise !== void 0) {
      _reject = this.$reject!;
      this.$resolve = this.$reject = this.$promise = void 0;
      _reject(err);
      _reject = void 0;
    }
    if (this.$initiator !== this) {
      (this.parent as Controller)._reject(err);
    }
  }

  /** @internal */
  private _activatingStack: number = 0;
  /** @internal */
  private _enterActivating(): void {
    ++this._activatingStack;
    if (this.$initiator !== this) {
      (this.parent as Controller)._enterActivating();
    }
  }
  /** @internal */
  private _leaveActivating(): void {
    if (this.state !== activating) {
      --this._activatingStack;
      // skip doing rest of the work if the controller is deactivated.
      this._resolve();
      if (this.$initiator !== this) {
        (this.parent as Controller)._leaveActivating();
      }
      return;
    }
    if (--this._activatingStack === 0) {
      if (this.vmKind !== vmkSynth && this._lifecycleHooks!.attached != null) {
        _retPromise = onResolveAll(...this._lifecycleHooks!.attached.map(callAttachedHook, this));
      }

      if (this._vmHooks._attached) {
        /* istanbul ignore next */
        if (__DEV__ && this.debug) { this.logger!.trace(`attached()`); }

        _retPromise = onResolveAll(_retPromise, this._vm!.attached!(this.$initiator));
      }

      if (isPromise(_retPromise)) {
        this._ensurePromise();
        _retPromise.then(() => {
          this.state = activated;
          // Resolve this.$promise, signaling that activation is done (path 1 of 2)
          this._resolve();
          if (this.$initiator !== this) {
            (this.parent as Controller)._leaveActivating();
          }
        }).catch((err: Error) => {
          this._reject(err);
        });
        _retPromise = void 0;
        return;
      }
      _retPromise = void 0;

      this.state = activated;
      // Resolve this.$promise (if present), signaling that activation is done (path 2 of 2)
      this._resolve();
    }
    if (this.$initiator !== this) {
      (this.parent as Controller)._leaveActivating();
    }
  }

  /** @internal */
  private _detachingStack: number = 0;
  /** @internal */
  private _enterDetaching(): void {
    ++this._detachingStack;
  }
  /** @internal */
  private _leaveDetaching(): void {
    if (--this._detachingStack === 0) {
      // Note: this controller is the initiator (detach is only ever called on the initiator)
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`detach()`); }

      this._enterUnbinding();
      this.removeNodes();

      let cur = this.$initiator.head as Controller | null;
      let ret: void | Promise<void> = void 0;

      while (cur !== null) {
        if (cur !== this) {
          /* istanbul ignore next */
          if (cur.debug) { cur.logger!.trace(`detach()`); }

          cur.removeNodes();
        }

        if (cur._isBindingDone) {
          if (cur.vmKind !== vmkSynth && cur._lifecycleHooks!.unbinding != null) {
            ret = onResolveAll(...cur._lifecycleHooks!.unbinding.map(callUnbindingHook, cur));
          }

          if (cur._vmHooks._unbinding) {
            if (cur.debug) { cur.logger!.trace('unbinding()'); }

            ret = onResolveAll(ret, cur.viewModel!.unbinding(cur.$initiator, cur.parent));
          }
        }

        if (isPromise(ret)) {
          this._ensurePromise();
          this._enterUnbinding();
          ret.then(() => {
            this._leaveUnbinding();
          }).catch((err: Error) => {
            this._reject(err);
          });
        }

        ret = void 0;

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
    if (--this._unbindingStack === 0) {
      /* istanbul ignore next */
      if (__DEV__ && this.debug) { this.logger!.trace(`unbind()`); }

      let cur = this.$initiator.head as Controller | null;
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
      this._isBindingDone = false;
      this.isBound = false;
      this.unbind();
    }
  }

  public addBinding(binding: IBinding): void {
    if (this.bindings === null) {
      this.bindings = [binding];
    } else {
      this.bindings[this.bindings.length] = binding;
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

  public lockScope(scope: Writable<Scope>): void {
    this.scope = scope;
    this.hasLockedScope = true;
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
    /* istanbul ignore next */
    if (__DEV__ && this.debug) { this.logger!.trace(`dispose()`); }

    if ((this.state & disposed) === disposed) {
      return;
    }
    this.state |= disposed;

    if (this._vmHooks._dispose) {
      this._vm!.dispose();
    }

    if (this.children !== null) {
      this.children.forEach(callDispose);
      this.children = null;
    }

    this.scope = null;

    this.nodes = null;
    this.location = null;

    this.viewFactory = null;
    if (this._vm !== null) {
      controllerLookup.delete(this._vm);
      this._vm = null;
    }
    this._vm = null;
    this.host = null;
    this.shadowRoot = null;
    this.container.disposeResolvers();
  }

  public accept(visitor: ControllerVisitor): void | true {
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
  }
}

const controllerLookup: WeakMap<object, Controller> = new WeakMap();

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
    if (instance[handler] != null
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
    ast = new AccessScopeExpression(key as string, 0);
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

  public readonly _define: boolean;

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
    this._define = 'define' in target;

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
  readonly parent: IHydratedController | null;
  readonly isBound: boolean;
  readonly bindings: readonly IBinding[] | null;

  addBinding(binding: IBinding): void;

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
   * Lock this view's scope to the provided `Scope`. The scope, which is normally set during `activate()`, will then not change anymore.
   *
   * This is used by `au-render` to set the binding context of a view to a particular component instance.
   *
   * @param scope - The scope to lock this view to.
   */
  lockScope(scope: Scope): void;
  /**
   * The scope that belongs to this view. This property will always be defined when the `state` property of this view indicates that the view is currently bound.
   *
   * The `scope` may be set during `activate()` and unset during `deactivate()`, or it may be statically set during composing with `lockScope()`.
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
 * A representation of `IController` specific to a custom element whose `create` hook is about to be invoked (if present).
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
   * It may be overwritten by end user during the `create()` hook.
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
   * implement this hook to enable component tree traversal for plugins that use it (such as the router).
   *
   * Return `true` to stop traversal.
   */
  accept?(visitor: ControllerVisitor): void | true;
}

export interface ICompileHooks {
  define?(
    controller: IDryCustomElementController<this>,
    /**
     * The context where this element is hydrated.
     *
     * This is created by the controller associated with the CE creating this this controller
     */
    hydrationContext: IHydrationContext | null,
    definition: CustomElementDefinition,
  ): PartialCustomElementDefinition | void;
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
   * An internal mechanism to manually halt + resume hydration process
   *
   * - 0: no hydration
   * - 1: hydrate until define() lifecycle
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

function callDispose(disposable: IDisposable): void {
  disposable.dispose();
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

function callBindingHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'binding'>) {
  return l.instance.binding(this._vm!, this['$initiator'], this.parent!);
}

function callBoundHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'bound'>) {
  return l.instance.bound(this._vm!, this['$initiator'], this.parent!);
}

function callAttachingHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attaching'>) {
  return l.instance.attaching(this._vm!, this['$initiator'], this.parent!);
}

function callAttachedHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'attached'>) {
  return l.instance.attached(this._vm!, this['$initiator']);
}

function callDetachingHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'detaching'>) {
  return l.instance.detaching(this._vm!, this['$initiator'], this.parent!);
}

function callUnbindingHook(this: Controller, l: LifecycleHooksEntry<IActivationHooks<IHydratedController>, 'unbinding'>) {
  return l.instance.unbinding(this._vm!, this['$initiator'], this.parent!);
}

// some reuseable variables to avoid creating nested blocks inside hot paths of controllers
let _resolve: undefined | (() => unknown);
let _reject: undefined | ((err: unknown) => unknown);
let _retPromise: void | Promise<void>;

const setRef = refs.set;
