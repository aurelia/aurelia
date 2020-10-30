/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  IContainer,
  IIndexable,
  nextId,
  Writable,
  Constructable,
  IDisposable,
  isObject,
  ILogger,
  LogLevel,
  resolveAll,
} from '@aurelia/kernel';
import {
  IBinding,
  Scope,
  LifecycleFlags,
  ILifecycle,
  IBindingTargetAccessor,
  PropertyBinding,
  ProxyObserver,
  BindableObserver,
  BindableDefinition,
} from '@aurelia/runtime';
import { HooksDefinition } from '../definitions';
import { INodeSequence, IRenderLocation } from '../dom';
import {
  IController,
  IViewModel,
  ViewModelKind,
  MountStrategy,
  ISyntheticView,
  ICustomAttributeController,
  ICustomElementController,
  ICustomElementViewModel,
  ICustomAttributeViewModel,
  IActivationHooks,
  ICompileHooks,
  IHydratedController,
  IHydratedParentController,
  State,
  stringifyState,
  ControllerVisitor,
} from '../lifecycle';
import { CustomElementDefinition, CustomElement, CustomElementHost } from '../resources/custom-element';
import { CustomAttributeDefinition, CustomAttribute } from '../resources/custom-attribute';
import { IRenderContext, getRenderContext, RenderContext } from './render-context';
import { ChildrenObserver } from './children';
import { RegisteredProjections } from '../resources/custom-elements/au-slot';
import { IAppRoot } from '../app-root';
import { ElementProjector, IProjectorLocator } from '../projectors';
import { IPlatform } from '../platform';
import { IViewFactory } from './view';

function callDispose(disposable: IDisposable): void {
  disposable.dispose();
}

type BindingContext<C extends IViewModel> = IIndexable<
  C &
  Required<ICompileHooks> &
  Required<IActivationHooks<IHydratedParentController | null>>
>;

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
export class Controller<C extends IViewModel = IViewModel> implements IController<C> {
  public readonly id: number = nextId('au$component');

  public head: Controller<C> | null = null;
  public tail: Controller<C> | null = null;
  public next: Controller<C> | null = null;

  public parent: Controller | null = null;
  public bindings: IBinding[] | undefined = void 0;
  public children: Controller[] | undefined = void 0;

  public hasLockedScope: boolean = false;

  public isStrictBinding: boolean = false;

  public scope: Scope | undefined = void 0;
  public hostScope: Scope | null = null;
  public projector: ElementProjector | undefined = void 0;

  public nodes: INodeSequence | undefined = void 0;
  public context: RenderContext | undefined = void 0;
  public location: IRenderLocation | undefined = void 0;
  public mountStrategy: MountStrategy = MountStrategy.insertBefore;

  public state: State = State.none;
  public get isActive(): boolean {
    return (this.state & (State.activating | State.activated)) > 0 && (this.state & State.deactivating) === 0;
  }

  private get name(): string {
    let parentName = this.parent?.name ?? '';
    parentName = parentName.length > 0 ? `${parentName} -> ` : '';
    switch (this.vmKind) {
      case ViewModelKind.customAttribute:
        return `${parentName}Attribute<${this.viewModel?.constructor.name}>`;
      case ViewModelKind.customElement:
        return `${parentName}Element<${this.viewModel?.constructor.name}>`;
      case ViewModelKind.synthetic:
        return `${parentName}View<${this.viewFactory?.name}>`;
    }
  }

  private logger: ILogger | null = null;
  private debug: boolean = false;
  private fullyNamed: boolean = false;

  public readonly platform: IPlatform;
  public readonly lifecycle: ILifecycle;
  public readonly hooks: HooksDefinition;

  public constructor(
    public root: IAppRoot | null,
    public container: IContainer,
    public readonly vmKind: ViewModelKind,
    public flags: LifecycleFlags,
    public readonly definition: CustomElementDefinition | CustomAttributeDefinition | undefined,
    /**
     * The viewFactory. Only present for synthetic views.
     */
    public viewFactory: IViewFactory | undefined,
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    public viewModel: C | undefined,
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    public bindingContext: BindingContext<C> | undefined,
    /**
     * The physical host dom node. Only present for custom elements.
     */
    public host: Node | undefined,
  ) {
    if (root === null && container.has(IAppRoot, true)) {
      this.root = container.get<IAppRoot>(IAppRoot);
    }
    this.platform = container.get(IPlatform);
    this.lifecycle = container.get(ILifecycle);
    switch (vmKind) {
      case ViewModelKind.customAttribute:
      case ViewModelKind.customElement:
        this.hooks = new HooksDefinition(viewModel!);
        break;
      case ViewModelKind.synthetic:
        this.hooks = HooksDefinition.none;
        break;
    }
  }

  public static getCached<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> | undefined {
    return controllerLookup.get(viewModel) as ICustomElementController<C> | undefined;
  }

  public static getCachedOrThrow<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> {
    const controller = Controller.getCached(viewModel);
    if (controller === void 0) {
      throw new Error(`There is no cached controller for the provided ViewModel: ${String(viewModel)}`);
    }
    return controller as ICustomElementController<C>;
  }

  public static forCustomElement<C extends ICustomElementViewModel = ICustomElementViewModel>(
    root: IAppRoot | null,
    container: IContainer,
    viewModel: C,
    host: Node,
    // projections *targeted* for this custom element. these are not the projections *provided* by this custom element.
    targetedProjections: RegisteredProjections | null,
    flags: LifecycleFlags = LifecycleFlags.none,
    hydrate: boolean = true,
    // Use this when `instance.constructor` is not a custom element type to pass on the CustomElement definition
    definition: CustomElementDefinition | undefined = void 0,
  ): ICustomElementController<C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomElementController<C>;
    }

    definition = definition ?? CustomElement.getDefinition(viewModel.constructor as Constructable);
    flags |= definition.strategy;

    const controller = new Controller<C>(
      /* root           */root,
      /* container      */container,
      /* vmKind         */ViewModelKind.customElement,
      /* flags          */flags,
      /* definition     */definition,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<C>(flags, viewModel),
      /* host           */host,
    );

    controllerLookup.set(viewModel, controller as Controller);

    if (hydrate) {
      controller.hydrateCustomElement(container, targetedProjections);
    }

    return controller as unknown as ICustomElementController<C>;
  }

  public static forCustomAttribute<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(
    root: IAppRoot | null,
    container: IContainer,
    viewModel: C,
    host: Node,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): ICustomAttributeController<C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomAttributeController<C>;
    }

    const definition = CustomAttribute.getDefinition(viewModel.constructor as Constructable);
    flags |= definition.strategy;

    const controller = new Controller<C>(
      /* root           */root,
      /* container      */container,
      /* vmKind         */ViewModelKind.customAttribute,
      /* flags          */flags,
      /* definition     */definition,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<C>(flags, viewModel),
      /* host           */host
    );

    controllerLookup.set(viewModel, controller as Controller);

    controller.hydrateCustomAttribute();

    return controller as unknown as ICustomAttributeController<C>;
  }

  public static forSyntheticView(
    root: IAppRoot | null,
    context: IRenderContext,
    viewFactory: IViewFactory,
    flags: LifecycleFlags = LifecycleFlags.none,
    parentController: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined = void 0,
  ): ISyntheticView {
    const controller = new Controller(
      /* root           */root,
      /* container      */context,
      /* vmKind         */ViewModelKind.synthetic,
      /* flags          */flags,
      /* definition     */void 0,
      /* viewFactory    */viewFactory,
      /* viewModel      */void 0,
      /* bindingContext */void 0,
      /* host           */void 0,
    );
    // deepscan-disable-next-line
    controller.parent = parentController as Controller ?? null;

    controller.hydrateSynthetic(context);

    return controller as unknown as ISyntheticView;
  }

  /** @internal */
  public hydrateCustomElement(
    parentContainer: IContainer,
    targetedProjections: RegisteredProjections | null,
  ): void {
    this.logger = parentContainer.get(ILogger).root;
    this.debug = this.logger.config.level <= LogLevel.debug;
    if (this.debug) {
      this.logger = this.logger.scopeTo(this.name);
    }

    let definition = this.definition as CustomElementDefinition;
    const flags = this.flags |= definition.strategy;
    const instance = this.viewModel as BindingContext<C>;
    createObservers(this.lifecycle, definition, flags, instance);
    createChildrenObservers(this as Controller, definition, flags, instance);

    this.scope = Scope.create(flags, this.bindingContext!, null);

    const hooks = this.hooks;
    if (hooks.hasDefine) {
      if (this.debug) {
        this.logger.trace(`invoking define() hook`);
      }
      const result = instance.define(
        /* controller      */this as ICustomElementController,
        /* parentContainer */parentContainer,
        /* definition      */definition,
      );
      if (result !== void 0 && result !== definition) {
        definition = CustomElementDefinition.getOrCreate(result);
      }
    }

    const context = this.context = getRenderContext(definition, parentContainer, targetedProjections?.projections) as RenderContext;
    // Support Recursive Components by adding self to own context
    definition.register(context);
    if (definition.injectable !== null) {
      // If the element is registered as injectable, support injecting the instance into children
      context.beginChildComponentOperation(instance as ICustomElementViewModel);
    }

    // If this is the root controller, then the AppRoot will invoke things in the following order:
    // - Controller.hydrateCustomElement
    // - runAppTasks('hydrating') // may return a promise
    // - Controller.compile
    // - runAppTasks('hydrated') // may return a promise
    // - Controller.compileChildren
    // This keeps hydration synchronous while still allowing the composition root compile hooks to do async work.
    if ((this.root?.controller as this | undefined) !== this) {
      this.hydrate(targetedProjections);
      this.hydrateChildren();
    }
  }

  /** @internal */
  public hydrate(
    targetedProjections: RegisteredProjections | null,
  ): void {
    if (this.hooks.hasHydrating) {
      if (this.debug) {
        this.logger!.trace(`invoking hasHydrating() hook`);
      }
      (this.viewModel as BindingContext<C>).hydrating(this as ICustomElementController);
    }

    const compiledContext = this.context!.compile(targetedProjections);
    const compiledDefinition = compiledContext.compiledDefinition;

    compiledContext.registerProjections(compiledDefinition.projectionsMap, this.scope!);
    // once the projections are registered, we can cleanup the projection map to prevent memory leaks.
    compiledDefinition.projectionsMap.clear();
    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const projectorLocator = this.context!.get<IProjectorLocator>(IProjectorLocator);
    this.projector = projectorLocator.getElementProjector(
      this as ICustomElementController,
      this.host as CustomElementHost<HTMLElement>,
      compiledDefinition,
    );

    (this.viewModel as Writable<C>).$controller = this;
    this.nodes = compiledContext.createNodes();

    if (this.hooks.hasHydrated) {
      if (this.debug) {
        this.logger!.trace(`invoking hasHydrated() hook`);
      }
      (this.viewModel as BindingContext<C>).hydrated(this as ICustomElementController);
    }
  }

  /** @internal */
  public hydrateChildren(): void {
    const targets = this.nodes!.findTargets();
    this.context!.compose(
      /* flags      */this.flags,
      /* controller */this as ICustomElementController,
      /* targets    */targets,
      /* definition */this.context!.compiledDefinition,
      /* host       */this.host,
    );

    if (this.hooks.hasCreated) {
      if (this.debug) {
        this.logger!.trace(`invoking created() hook`);
      }
      (this.viewModel as BindingContext<C>).created(this as ICustomElementController);
    }
  }

  private hydrateCustomAttribute(): void {
    const definition = this.definition as CustomElementDefinition;
    const flags = this.flags | definition.strategy;
    const instance = this.viewModel!;
    createObservers(this.lifecycle, definition, flags, instance);

    (instance as Writable<C>).$controller = this;
  }

  private hydrateSynthetic(
    context: IRenderContext,
  ): void {
    this.context = context as RenderContext;
    const compiledContext = context.compile(null);
    const compiledDefinition = compiledContext.compiledDefinition;

    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const nodes = this.nodes = compiledContext.createNodes();
    const targets = nodes.findTargets();
    compiledContext.compose(
      /* flags      */this.flags,
      /* controller */this,
      /* targets    */targets,
      /* definition */compiledDefinition,
      /* host       */void 0,
    );
  }

  private $initiator: Controller = null!;
  private $flags: LifecycleFlags = LifecycleFlags.none;
  public activate(
    initiator: Controller,
    parent: Controller | null,
    flags: LifecycleFlags,
    scope?: Scope,
    hostScope?: Scope | null,
  ): void | Promise<void> {
    switch (this.state) {
      case State.none:
      case State.deactivated:
        if (!(parent === null || parent.isActive)) {
          // If this is not the root, and the parent is either:
          // 1. Not activated, or activating children OR
          // 2. Deactivating itself
          // abort.
          return;
        }
        // Otherwise, proceed normally.
        // 'deactivated' and 'none' are treated the same because, from an activation perspective, they mean the same thing.
        this.state = State.activating;
        break;
      case State.activated:
        // If we're already activated, no need to do anything.
        return;
      case State.disposed:
        throw new Error(`${this.name} trying to activate a controller that is disposed.`);
      default:
        throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
    }

    this.parent = parent;
    if (this.debug && !this.fullyNamed) {
      this.fullyNamed = true;
      this.logger = this.context!.get(ILogger).root.scopeTo(this.name);
      this.logger!.trace(`activate()`);
    }
    this.hostScope = hostScope ?? null;
    flags |= LifecycleFlags.fromBind;

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        // Custom element scope is created and assigned during hydration
        (this.scope as Writable<Scope>).parentScope = scope === void 0 ? null : scope;
        break;
      case ViewModelKind.customAttribute:
        this.scope = scope;
        break;
      case ViewModelKind.synthetic:
        if (scope === void 0 || scope === null) {
          throw new Error(`Scope is null or undefined`);
        }

        if (!this.hasLockedScope) {
          this.scope = scope;
        }
        break;
    }

    if (this.isStrictBinding) {
      flags |= LifecycleFlags.isStrictBindingStrategy;
    }

    this.$initiator = initiator;
    this.$flags = flags;

    if (this.hooks.hasBinding) {
      if (this.debug) { this.logger!.trace(`binding()`); }

      const ret = this.bindingContext!.binding(this.$initiator as IHydratedController, this.parent as IHydratedParentController, this.$flags);
      if (ret instanceof Promise) {
        return ret.then(this.bind.bind(this));
      }
    }

    return this.bind();
  }

  private bind(): void | Promise<void> {
    if (this.debug) { this.logger!.trace(`bind()`); }

    if (this.bindings !== void 0) {
      for (let i = 0; i < this.bindings.length; ++i) {
        this.bindings[i].$bind(this.$flags, this.scope!, this.hostScope);
      }
    }

    if (this.hooks.hasBound) {
      if (this.debug) { this.logger!.trace(`bound()`); }

      const ret = this.bindingContext!.bound(this.$initiator as IHydratedController, this.parent as IHydratedParentController, this.$flags);
      if (ret instanceof Promise) {
        return ret.then(this.attach.bind(this));
      }
    }

    return this.attach();
  }

  private attach(): void | Promise<void> {
    if (this.debug) { this.logger!.trace(`attach()`); }

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.projector!.project(this.nodes!);
        break;
      case ViewModelKind.synthetic:
        switch (this.mountStrategy) {
          case MountStrategy.append:
            this.nodes!.appendTo(this.location!);
            break;
          case MountStrategy.insertBefore:
            this.nodes!.insertBefore(this.location!);
            break;
        }
    }

    let ret: Promise<void> | void = void 0;
    let promises: Promise<void>[] | undefined = void 0;
    if (this.hooks.hasAttaching) {
      if (this.debug) { this.logger!.trace(`attaching()`); }

      ret = this.bindingContext!.attaching(this.$initiator as IHydratedController, this.parent as IHydratedParentController, this.$flags);
      if (ret instanceof Promise) {
        promises = [ret];
      }
    }
    if (this.children !== void 0) {
      for (let i = 0; i < this.children.length; ++i) {
        ret = this.children[i].activate(this.$initiator, this as Controller, this.$flags, this.scope, this.hostScope);
        if (ret instanceof Promise) {
          (promises ??= []).push(ret);
        }
      }
    }

    ret = promises === void 0 ? void 0 : resolveAll(...promises);
    if (ret instanceof Promise) {
      return ret.then(this.attached.bind(this));
    }
    return this.attached();
  }

  private attached(): void | Promise<void> {
    this.state = State.activated;

    if (this.hooks.hasAttached) {
      if (this.debug) { this.logger!.trace(`attached()`); }

      return this.bindingContext!.attached!(this.$initiator as IHydratedController, this.$flags);
    }
  }

  public deactivate(
    initiator: Controller,
    parent: Controller | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    switch ((this.state & ~State.released)) {
      case State.activated:
        // We're fully activated, so proceed with normal deactivation.
        this.state = State.deactivating;
        break;
      case State.none:
      case State.deactivated:
      case State.disposed:
      case State.deactivated | State.disposed:
        // If we're already deactivated (or even disposed), or never activated in the first place, no need to do anything.
        return;
      default:
        throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
    }

    if (this.debug) { this.logger!.trace(`deactivate()`); }

    this.$initiator = initiator;
    this.$flags = flags;

    let promises: Promise<void>[] | undefined = void 0;
    let ret: Promise<void> | void = void 0;
    if (this.children !== void 0) {
      for (let i = 0; i < this.children.length; ++i) {
        ret = this.children[i].deactivate(initiator, this as Controller, flags);
        if (ret instanceof Promise) {
          (promises ??= []).push(ret);
        }
      }
    }

    if (this.hooks.hasBeforeDetach) {
      if (this.debug) { this.logger!.trace(`beforeDetach()`); }

      ret = this.bindingContext!.beforeDetach(this.$initiator as IHydratedController, this.parent as IHydratedParentController, this.$flags);
      if (ret instanceof Promise) {
        (promises ??= []).push(ret);
      }
    }

    // Note: if a 3rd party plugin happens to do any async stuff in a template controller before calling deactivate on its view,
    // then the linking will become out of order.
    // For framework components, this shouldn't cause issues.
    // We can only prevent that by linking up after awaiting the beforeDetach promise, which would add an extra tick + a fair bit of
    // overhead on this hot path, so it's (for now) a deliberate choice to not account for such situation.
    // Just leaving the note here so that we know to look here if a weird beforeDetach-related timing issue is ever reported.
    if (initiator.head === null) {
      initiator.head = this as Controller;
    } else {
      initiator.tail!.next = this as Controller;
    }
    initiator.tail = this as Controller;

    ret = promises === void 0 ? void 0 : resolveAll(...promises);

    if (initiator !== this) {
      // Only beforeDetach is called + the linked list is built when any controller that is not the initiator, is deactivated.
      // The rest is handled by the initiator.
      // This means that descendant controllers have to make sure to await the initiator's promise before doing any subsequent
      // controller api calls, or race conditions might occur.
      return ret;
    }

    if (ret instanceof Promise) {
      return ret.then(this.detach.bind(this));
    }

    return this.detach();
  }

  private detach(): void | Promise<void> {
    if (this.debug) { this.logger!.trace(`detach()`); }

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.projector!.take(this.nodes!);
        break;
      case ViewModelKind.synthetic:
        this.nodes!.remove();
        this.nodes!.unlink();
        break;
    }

    let promises: Promise<void>[] | undefined = void 0;
    let ret: Promise<void> | void = void 0;
    let cur = this.$initiator.head as Controller | null;
    let next: Controller | null = null;
    while (cur !== null) {
      if (cur !== this) {
        if (cur.debug) { cur.logger!.trace(`detach()`); }

        switch (cur.vmKind) {
          case ViewModelKind.customElement:
            cur.projector!.take(cur.nodes!);
            break;
          case ViewModelKind.synthetic:
            cur.nodes!.remove();
            cur.nodes!.unlink();
            break;
        }
      }
      ret = cur.beforeUnbind();
      if (ret instanceof Promise) {
        (promises ??= []).push(ret);
      }
      next = cur.next;
      cur.next = null;
      cur = next;
    }

    this.head = this.tail = null;

    if (promises !== void 0) {
      return resolveAll(...promises);
    }
  }

  private beforeUnbind(): void | Promise<void> {
    if (this.hooks.hasBeforeUnbind) {
      if (this.debug) { this.logger!.trace(`beforeUnbind()`); }

      const ret = this.bindingContext!.beforeUnbind(this.$initiator as IHydratedController, this.parent as IHydratedParentController, this.$flags);
      if (ret instanceof Promise) {
        return ret.then(this.unbind.bind(this));
      }
    }

    return this.unbind();
  }

  private unbind(): void {
    if (this.debug) { this.logger!.trace(`unbind()`); }

    const flags = this.$flags | LifecycleFlags.fromUnbind;

    if (this.bindings !== void 0) {
      for (let i = 0; i < this.bindings.length; ++i) {
        this.bindings[i].$unbind(flags);
      }
    }

    this.parent = null;

    switch (this.vmKind) {
      case ViewModelKind.customAttribute:
        this.scope = void 0;
        break;
      case ViewModelKind.synthetic:
        if (!this.hasLockedScope) {
          this.scope = void 0;
        }

        if (
          (this.state & State.released) === State.released &&
          !this.viewFactory!.tryReturnToCache(this as ISyntheticView)
        ) {
          this.dispose();
        }
        break;
      case ViewModelKind.customElement:
        (this.scope as Writable<Scope>).parentScope = null;
        break;
    }

    if ((flags & LifecycleFlags.dispose) === LifecycleFlags.dispose) {
      this.dispose();
    }
    this.state = (this.state & State.disposed) | State.deactivated;
  }

  public addBinding(binding: IBinding): void {
    if (this.bindings === void 0) {
      this.bindings = [binding];
    } else {
      this.bindings[this.bindings.length] = binding;
    }
  }

  public addController(controller: Controller): void {
    if (this.children === void 0) {
      this.children = [controller];
    } else {
      this.children[this.children.length] = controller;
    }
  }

  public is(name: string): boolean {
    switch (this.vmKind) {
      case ViewModelKind.customAttribute: {
        const def = CustomAttribute.getDefinition(this.viewModel!.constructor as Constructable);
        return def.name === name;
      }
      case ViewModelKind.customElement: {
        const def = CustomElement.getDefinition(this.viewModel!.constructor as Constructable);
        return def.name === name;
      }
      case ViewModelKind.synthetic:
        return this.viewFactory!.name === name;
    }
  }

  public lockScope(scope: Writable<Scope>): void {
    this.scope = scope;
    this.hasLockedScope = true;
  }

  public setLocation(location: IRenderLocation, mountStrategy: MountStrategy): void {
    this.location = location;
    this.mountStrategy = mountStrategy;
  }

  public release(): void {
    this.state |= State.released;
  }

  public dispose(): void {
    if (this.debug) { this.logger!.trace(`dispose()`); }

    if ((this.state & State.disposed) === State.disposed) {
      return;
    }
    this.state |= State.disposed;

    if (this.hooks.hasDispose) {
      this.bindingContext!.dispose();
    }

    if (this.children !== void 0) {
      this.children.forEach(callDispose);
      this.children = void 0;
    }

    this.scope = void 0;
    this.projector = void 0;

    this.nodes = void 0;
    this.context = void 0;
    this.location = void 0;

    this.viewFactory = void 0;
    if (this.viewModel !== void 0) {
      controllerLookup.delete(this.viewModel);
      this.viewModel = void 0;
    }
    this.bindingContext = void 0;
    this.host = void 0;
    this.root = null;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (visitor(this as IHydratedController) === true) {
      return true;
    }

    if (this.hooks.hasAccept && this.bindingContext!.accept(visitor) === true) {
      return true;
    }

    if (this.children !== void 0) {
      const { children } = this;
      for (let i = 0, ii = children.length; i < ii; ++i) {
        if (children[i].accept(visitor) === true) {
          return true;
        }
      }
    }
  }

  public getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined {
    const { bindings } = this;
    if (bindings !== void 0) {
      const binding = bindings.find(b => (b as PropertyBinding).targetProperty === propertyName) as PropertyBinding;
      if (binding !== void 0) {
        return binding.targetObserver;
      }
    }
    return void 0;
  }
}

function getBindingContext<C extends IViewModel>(flags: LifecycleFlags, instance: object): BindingContext<C> {
  if ((instance as IIndexable).noProxy === true || (flags & LifecycleFlags.proxyStrategy) === 0) {
    return instance as BindingContext<C>;
  }

  return ProxyObserver.getOrCreate(instance).proxy as unknown as BindingContext<C>;
}

function getLookup(instance: IIndexable): Record<string, BindableObserver | ChildrenObserver> {
  let lookup = instance.$observers;
  if (lookup === void 0) {
    Reflect.defineProperty(
      instance,
      '$observers',
      {
        enumerable: false,
        value: lookup = {},
      },
    );
  }
  return lookup as Record<string, BindableObserver | ChildrenObserver>;
}

function createObservers(
  lifecycle: ILifecycle,
  definition: CustomElementDefinition | CustomAttributeDefinition,
  flags: LifecycleFlags,
  instance: object,
): void {
  const bindables = definition.bindables;
  const observableNames = Object.getOwnPropertyNames(bindables);
  const length = observableNames.length;
  if (length > 0) {
    let name: string;
    let bindable: BindableDefinition;

    if ((flags & LifecycleFlags.proxyStrategy) > 0) {
      for (let i = 0; i < length; ++i) {
        name = observableNames[i];
        bindable = bindables[name];

        new BindableObserver(
          lifecycle,
          flags,
          ProxyObserver.getOrCreate(instance).proxy,
          name,
          bindable.callback,
          bindable.set,
        );
      }
    } else {
      const observers = getLookup(instance as IIndexable);

      for (let i = 0; i < length; ++i) {
        name = observableNames[i];

        if (observers[name] === void 0) {
          bindable = bindables[name];

          observers[name] = new BindableObserver(
            lifecycle,
            flags,
            instance as IIndexable,
            name,
            bindable.callback,
            bindable.set,
          );
        }
      }
    }
  }
}

function createChildrenObservers(
  controller: Controller,
  definition: CustomElementDefinition,
  flags: LifecycleFlags,
  instance: object,
): void {
  const childrenObservers = definition.childrenObservers;
  const childObserverNames = Object.getOwnPropertyNames(childrenObservers);
  const length = childObserverNames.length;
  if (length > 0) {
    const observers = getLookup(instance as IIndexable);

    let name: string;
    for (let i = 0; i < length; ++i) {
      name = childObserverNames[i];

      if (observers[name] == void 0) {
        const childrenDescription = childrenObservers[name];
        observers[name] = new ChildrenObserver(
          controller as ICustomElementController,
          instance as IIndexable,
          flags,
          name,
          childrenDescription.callback,
          childrenDescription.query,
          childrenDescription.filter,
          childrenDescription.map,
          childrenDescription.options,
        );
      }
    }
  }
}

export function isCustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel>(value: unknown): value is ICustomElementController<C> {
  return value instanceof Controller && value.vmKind === ViewModelKind.customElement;
}

export function isCustomElementViewModel(value: unknown): value is ICustomElementViewModel {
  return isObject(value) && CustomElement.isType(value.constructor);
}
