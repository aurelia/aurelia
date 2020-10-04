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
  PropertyBinding,
} from '../binding/property-binding';
import {
  HooksDefinition,
} from '../definitions';
import {
  INode,
  INodeSequence,
  IRenderLocation
} from '../dom';
import {
  LifecycleFlags,
} from '../flags';
import {
  IBinding,
  IController,
  ILifecycle,
  IViewModel,
  ViewModelKind,
  MountStrategy,
  IViewFactory,
  ISyntheticView,
  ICustomAttributeController,
  IDryCustomElementController,
  IContextualCustomElementController,
  ICompiledCustomElementController,
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
import {
  IBindingTargetAccessor,
  IScope,
} from '../observation';
import {
  Scope,
} from '../observation/binding-context';
import {
  ProxyObserver,
} from '../observation/proxy-observer';
import {
  BindableObserver,
} from '../observation/bindable-observer';
import {
  IElementProjector,
  IProjectorLocator,
  CustomElementDefinition,
  CustomElement,
} from '../resources/custom-element';
import {
  CustomAttributeDefinition,
  CustomAttribute,
} from '../resources/custom-attribute';
import {
  BindableDefinition,
} from './bindable';
import {
  IRenderContext,
  getRenderContext,
  RenderContext,
} from './render-context';
import { ChildrenObserver } from './children';
import { RegisteredProjections } from '../resources/custom-elements/au-slot';
import { IStartTaskManager } from '../lifecycle-task';

function callDispose(disposable: IDisposable): void {
  disposable.dispose();
}

type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<
  C &
  Required<ICompileHooks<T>> &
  Required<IActivationHooks<IHydratedParentController<T> | null, T>>
>;

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
export class Controller<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>,
> implements IController<T, C> {
  public readonly id: number = nextId('au$component');

  public head: Controller<T, C> | null = null;
  public tail: Controller<T, C> | null = null;
  public next: Controller<T, C> | null = null;

  public parent: Controller<T> | null = null;
  public bindings: IBinding[] | undefined = void 0;
  public children: Controller<T>[] | undefined = void 0;

  public hasLockedScope: boolean = false;

  public isStrictBinding: boolean = false;

  public scope: IScope | undefined = void 0;
  public hostScope: IScope | null = null;
  public projector: IElementProjector | undefined = void 0;

  public nodes: INodeSequence<T> | undefined = void 0;
  public context: RenderContext<T> | undefined = void 0;
  public location: IRenderLocation<T> | undefined = void 0;
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

  private promise: Promise<void> | undefined = void 0;
  private resolve: (() => void) | undefined = void 0;
  private reject: ((reason?: unknown) => void) | undefined = void 0;
  private logger: ILogger | null = null;
  private debug: boolean = false;
  private fullyNamed: boolean = false;

  public constructor(
    public readonly vmKind: ViewModelKind,
    public flags: LifecycleFlags,
    public readonly lifecycle: ILifecycle,
    public readonly definition: CustomElementDefinition | CustomAttributeDefinition | undefined,
    public hooks: HooksDefinition,
    /**
     * The viewFactory. Only present for synthetic views.
     */
    public viewFactory: IViewFactory<T> | undefined,
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    public viewModel: C | undefined,
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    public bindingContext: BindingContext<T, C> | undefined,
    /**
     * The physical host dom node. Only present for custom elements.
     */
    public host: T | undefined,
  ) {}

  public static getCached<
    T extends INode = INode,
    C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>,
  >(viewModel: C): ICustomElementController<T, C> | undefined {
    return controllerLookup.get(viewModel) as ICustomElementController<T, C> | undefined;
  }

  public static getCachedOrThrow<
    T extends INode = INode,
    C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>,
  >(viewModel: C): ICustomElementController<T, C> {
    const controller = Controller.getCached(viewModel);
    if (controller === void 0) {
      throw new Error(`There is no cached controller for the provided ViewModel: ${String(viewModel)}`);
    }
    return controller as ICustomElementController<T, C>;
  }

  public static forCustomElement<
    T extends INode = INode,
    C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>,
  >(
    viewModel: C,
    lifecycle: ILifecycle,
    host: T,
    parentContainer: IContainer,
    // projections *targeted* for this custom element. these are not the projections *provided* by this custom element.
    targetedProjections: RegisteredProjections | null,
    flags: LifecycleFlags = LifecycleFlags.none,
    hydrate: boolean = true,
    // Use this when `instance.constructor` is not a custom element type to pass on the CustomElement definition
    definition: CustomElementDefinition | undefined = void 0,
  ): ICustomElementController<T, C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomElementController<T, C>;
    }

    definition = definition ?? CustomElement.getDefinition(viewModel.constructor as Constructable);
    flags |= definition.strategy;

    const controller = new Controller<T, C>(
      /* vmKind         */ViewModelKind.customElement,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* definition     */definition,
      /* hooks          */definition.hooks,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<T, C>(flags, viewModel),
      /* host           */host,
    );

    controllerLookup.set(viewModel, controller as Controller);

    if (hydrate) {
      controller.hydrateCustomElement(parentContainer, targetedProjections);
    }

    return controller as unknown as ICustomElementController<T, C>;
  }

  public static forCustomAttribute<
    T extends INode = INode,
    C extends ICustomAttributeViewModel<T> = ICustomAttributeViewModel<T>,
  >(
    viewModel: C,
    lifecycle: ILifecycle,
    host: T,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): ICustomAttributeController<T, C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomAttributeController<T, C>;
    }

    const definition = CustomAttribute.getDefinition(viewModel.constructor as Constructable);
    flags |= definition.strategy;

    const controller = new Controller<T, C>(
      /* vmKind         */ViewModelKind.customAttribute,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* definition     */definition,
      /* hooks          */definition.hooks,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<T, C>(flags, viewModel),
      /* host           */host
    );

    controllerLookup.set(viewModel, controller as Controller);

    controller.hydrateCustomAttribute();

    return controller as unknown as ICustomAttributeController<T, C>;
  }

  public static forSyntheticView<
    T extends INode = INode,
  >(
    viewFactory: IViewFactory<T>,
    lifecycle: ILifecycle,
    context: IRenderContext<T>,
    flags: LifecycleFlags = LifecycleFlags.none,
    parentController: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined = void 0,
  ): ISyntheticView<T> {
    const controller = new Controller<T>(
      /* vmKind         */ViewModelKind.synthetic,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* definition     */void 0,
      /* hooks          */HooksDefinition.none,
      /* viewFactory    */viewFactory,
      /* viewModel      */void 0,
      /* bindingContext */void 0,
      /* host           */void 0,
    );
    controller.parent = parentController as Controller<T> ?? null;

    controller.hydrateSynthetic(context);

    return controller as unknown as ISyntheticView<T>;
  }

  private hydrateCustomElement(
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
    const instance = this.viewModel as BindingContext<T, C>;
    createObservers(this.lifecycle, definition, flags, instance);
    createChildrenObservers(this as Controller, definition, flags, instance);

    const scope = this.scope = Scope.create(flags, this.bindingContext!, null);

    const hooks = this.hooks;
    if (hooks.hasCreate) {
      if (this.debug) {
        this.logger.trace(`invoking create() hook`);
      }
      const result = instance.create(
        /* controller      */this as unknown as IDryCustomElementController<T, typeof instance>,
        /* parentContainer */parentContainer,
        /* definition      */definition,
      );
      if (result !== void 0 && result !== definition) {
        definition = CustomElementDefinition.getOrCreate(result);
      }
    }

    const context = this.context = getRenderContext<T>(definition, parentContainer, targetedProjections?.projections) as RenderContext<T>;
    // Support Recursive Components by adding self to own context
    definition.register(context);
    if (definition.injectable !== null) {
      // If the element is registered as injectable, support injecting the instance into children
      context.beginChildComponentOperation(instance as ICustomElementViewModel);
    }

    if (hooks.hasBeforeCompile) {
      if (this.debug) {
        this.logger.trace(`invoking hasBeforeCompile() hook`);
      }
      instance.beforeCompile(this as unknown as IContextualCustomElementController<T, typeof instance>);
    }

    const compiledContext = context.compile(targetedProjections);
    const compiledDefinition = compiledContext.compiledDefinition;

    compiledContext.registerProjections(compiledDefinition.projectionsMap, scope);
    // once the projections are registered, we can cleanup the projection map to prevent memory leaks.
    compiledDefinition.projectionsMap.clear();
    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const projectorLocator = parentContainer.get(IProjectorLocator);

    this.projector = projectorLocator.getElementProjector(
      context.dom,
      this as unknown as ICustomElementController,
      this.host!,
      compiledDefinition,
    );

    (instance as Writable<C>).$controller = this;
    const nodes = this.nodes = compiledContext.createNodes();

    if (hooks.hasAfterCompile) {
      if (this.debug) {
        this.logger.trace(`invoking hasAfterCompile() hook`);
      }
      instance.afterCompile(this as unknown as ICompiledCustomElementController<T, typeof instance>);
    }

    const taskmgr = parentContainer.get(IStartTaskManager);
    taskmgr.runBeforeCompileChildren(parentContainer);

    const targets = nodes.findTargets();
    compiledContext.render(
      /* flags      */this.flags,
      /* controller */this,
      /* targets    */targets,
      /* definition */compiledDefinition,
      /* host       */this.host,
    );

    if (hooks.hasAfterCompileChildren) {
      if (this.debug) {
        this.logger.trace(`invoking afterCompileChildren() hook`);
      }
      instance.afterCompileChildren(this as unknown as ICustomElementController<T, ICompileHooks<T>>);
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
    context: IRenderContext<T>,
  ): void {
    this.context = context as RenderContext<T>;
    const compiledContext = context.compile(null);
    const compiledDefinition = compiledContext.compiledDefinition;

    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const nodes = this.nodes = compiledContext.createNodes();
    const targets = nodes.findTargets();
    compiledContext.render(
      /* flags      */this.flags,
      /* controller */this,
      /* targets    */targets,
      /* definition */compiledDefinition,
      /* host       */void 0,
    );
  }

  private canceling: boolean = false;
  public cancel(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void {
    if (this.canceling) {
      return;
    }
    this.canceling = true;
    if ((this.state & State.activating) === State.activating) {
      this.state = (this.state ^ State.activating) | State.deactivating;
      this.bindingContext?.onCancel?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags);
      if (
        (this.state & State.activateChildrenCalled) === State.activateChildrenCalled &&
        this.children !== void 0
      ) {
        for (const child of this.children) {
          child.cancel(initiator, parent, flags);
        }
      }
    } else if ((this.state & State.deactivating) === State.deactivating) {
      this.state = (this.state ^ State.deactivating) | State.activating;
      this.bindingContext?.onCancel?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags);
      if (
        (this.state & State.deactivateChildrenCalled) === State.deactivateChildrenCalled &&
        this.children !== void 0
      ) {
        for (const child of this.children) {
          child.cancel(initiator, parent, flags);
        }
      }
    }
  }

  public activate(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
    scope?: IScope,
    hostScope?: IScope | null,
  ): void | Promise<void> {
    this.canceling = false;
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
        if ((this.state & State.activating) === State.activating) {
          // We're already activating, so no need to do anything.
          return this.promise;
        }
        if ((this.state & State.deactivating) === State.deactivating) {
          // We're in an incomplete deactivation, so we can still abort some of it.
          // Simply add the 'activating' bit (and remove 'deactivating' so we know what was the last request) and return.
          this.state = (this.state ^ State.deactivating) | State.activating;
          if (
            (this.state & State.deactivateChildrenCalled) === State.deactivateChildrenCalled &&
            this.children !== void 0
          ) {
            return resolveAll(
              this.onResolve(this.$activateChildren(initiator, parent, flags)),
              this.promise,
            );
          }
          return this.promise;
        } else {
          throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
        }
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
        (this.scope as Writable<IScope>).parentScope = scope === void 0 ? null : scope;
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

    return this.beforeBind(initiator, parent, flags);
  }

  private beforeBind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`beforeBind()`);
    }

    return this.onResolve(
      this.bindingContext?.beforeBind?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.bind(initiator, parent, flags);
      },
    );
  }

  private bind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`bind()`);
    }

    this.state |= State.beforeBindCalled;
    if ((this.state & State.deactivating) === State.deactivating) {
      return this.afterUnbind(initiator, parent, flags);
    }

    if (this.bindings !== void 0) {
      const { scope, hostScope, bindings } = this;
      for (let i = 0, ii = bindings.length; i < ii; ++i) {
        bindings[i].$bind(flags, scope!, hostScope);
      }
    }

    return this.afterBind(initiator, parent, flags);
  }

  private afterBind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`afterBind()`);
    }

    return this.onResolve(
      this.bindingContext?.afterBind?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.attach(initiator, parent, flags);
      },
    );
  }

  private attach(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`attach()`);
    }

    if ((this.state & State.deactivating) === State.deactivating) {
      return this.beforeUnbind(initiator, parent, flags);
    }

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.projector!.project(this.nodes!);
        break;
      case ViewModelKind.synthetic:
        switch (this.mountStrategy) {
          case MountStrategy.append:
            this.nodes!.appendTo(this.location! as T);
            break;
          case MountStrategy.insertBefore:
            this.nodes!.insertBefore(this.location!);
            break;
        }
        break;
    }

    return this.afterAttach(initiator, parent, flags);
  }

  private afterAttach(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`afterAttach()`);
    }

    return this.onResolve(
      this.bindingContext?.afterAttach?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.activateChildren(initiator, parent, flags);
      },
    );
  }

  private activateChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`activateChildren()`);
    }

    this.state |= State.activateChildrenCalled;

    return this.onResolve(
      this.$activateChildren(initiator, parent, flags),
      () => {
        return this.endActivate(initiator, parent, flags);
      },
    );
  }

  private $activateChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.children !== void 0) {
      const { children, scope, hostScope } = this;
      return resolveAll(
        ...children.map(child => {
          return child.activate(initiator, this as Controller<T>, flags, scope, hostScope);
        }),
      );
    }
  }

  private endActivate(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`afterAttachChildren()`);
    }

    this.state ^= State.activateChildrenCalled;
    if ((this.state & State.deactivating) === State.deactivating) {
      clearLinks(initiator);
      return this.beforeDetach(initiator, parent, flags);
    } else if ((this.state & State.beforeDetachCalled) === State.beforeDetachCalled) {
      this.state ^= State.beforeDetachCalled;
      this.resolvePromise();
      return;
    }

    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;

    if (initiator.head === null) {
      initiator.head = this as Controller<T>;
    } else {
      initiator.tail!.next = this as Controller<T>;
    }
    initiator.tail = this as Controller<T>;

    if (initiator === this) {
      if (initiator.head !== null) {
        let cur = initiator.head;
        initiator.head = initiator.tail = null;
        let next: Controller<T> | null;

        do {
          ret = cur.afterAttachChildren(initiator, parent, flags);
          if (ret instanceof Promise) {
            (promises ?? (promises = [])).push(ret);
          }
          next = cur.next;
          cur.next = null;
          cur = next!;
        } while (cur !== null);

        if (promises !== void 0) {
          const promise = promises.length === 1
            ? promises[0]
            : Promise.all(promises) as unknown as Promise<void>;

          return promise.then(() => {
            this.resolvePromise();
          });
        }
      }

      this.resolvePromise();
    }
  }

  private afterAttachChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): Promise<void> | void {
    return this.onResolve(
      this.bindingContext?.afterAttachChildren?.(initiator as IHydratedController<T>, flags),
      () => {
        if ((this.state & State.deactivating) === State.deactivating) {
          this.state = State.activated;
          // If the cancellation of activation was requested once the children were already activating,
          // then there were no more sensible cancellation points and we had to wait out the remainder of the operation.
          // Now, after activation finally finished, we can proceed to deactivate.
          return this.deactivate(this as Controller<T>, parent, flags);
        }

        this.state = State.activated;
        if (initiator !== this) {
          // For the initiator, the promise is resolved at the end of endAactivate because that promise resolution
          // has to come after all descendant postEndActivate calls resolved. Otherwise, the initiator might resolve
          // while some of its descendants are still busy.
          this.resolvePromise();
        }
      },
    );
  }

  public deactivate(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.canceling = false;
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
        if ((this.state & State.deactivating) === State.deactivating) {
          // We're already deactivating, so no need to do anything.
          return this.promise;
        }
        if ((this.state & State.activating) === State.activating) {
          // We're in an incomplete activation, so we can still abort some of it.
          // Simply add the 'deactivating' bit (and remove 'activating' so we know what was the last request) and return.
          this.state = (this.state ^ State.activating) | State.deactivating;
          if (
            (this.state & State.activateChildrenCalled) === State.activateChildrenCalled &&
            this.children !== void 0
          ) {
            return resolveAll(
              this.onResolve(this.$deactivateChildren(initiator, parent, flags)),
              this.promise,
            );
          }
          return this.promise;
        } else {
          throw new Error(`${this.name} unexpected state: ${stringifyState(this.state)}.`);
        }
    }

    if (this.debug) {
      this.logger!.trace(`deactivate()`);
    }

    return this.beforeDetach(initiator, parent, flags);
  }

  private beforeDetach(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`beforeDetach()`);
    }

    return this.onResolve(
      this.bindingContext?.beforeDetach?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.detach(initiator, parent, flags);
      },
    );
  }

  private detach(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`detach()`);
    }

    this.state |= State.beforeDetachCalled;
    if ((this.state & State.activating) === State.activating) {
      return this.afterAttach(initiator, parent, flags);
    }

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.projector!.take(this.nodes!);
        break;
      case ViewModelKind.synthetic:
        this.nodes!.remove();
        this.nodes!.unlink();
        break;
    }

    return this.beforeUnbind(initiator, parent, flags);
  }

  private beforeUnbind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`beforeUnbind()`);
    }

    return this.onResolve(
      this.bindingContext?.beforeUnbind?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.unbind(initiator, parent, flags);
      },
    );
  }

  private unbind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`unbind()`);
    }

    if ((this.state & State.activating) === State.activating) {
      return this.afterBind(initiator, parent, flags);
    }

    flags |= LifecycleFlags.fromUnbind;

    if (this.bindings !== void 0) {
      const { bindings } = this;
      for (let i = 0, ii = bindings.length; i < ii; ++i) {
        bindings[i].$unbind(flags);
      }
    }

    return this.afterUnbind(initiator, parent, flags);
  }

  private afterUnbind(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`afterUnbind()`);
    }

    return this.onResolve(
      this.bindingContext?.afterUnbind?.(initiator as IHydratedController<T>, parent as IHydratedParentController<T>, flags),
      () => {
        return this.deactivateChildren(initiator, parent, flags);
      },
    );
  }

  private deactivateChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`deactivateChildren()`);
    }

    this.state |= State.deactivateChildrenCalled;

    return this.onResolve(
      this.$deactivateChildren(initiator, parent, flags),
      () => {
        return this.endDeactivate(initiator, parent, flags);
      },
    );
  }

  private $deactivateChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.children !== void 0) {
      const { children } = this;
      return resolveAll(
        ...children.map(child => {
          return child.deactivate(initiator, this as Controller<T>, flags);
        }),
      );
    }
  }

  private endDeactivate(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.debug) {
      this.logger!.trace(`afterUnbindChildren()`);
    }

    this.state ^= State.deactivateChildrenCalled;
    if ((this.state & State.activating) === State.activating) {
      // In a short-circuit it's possible that descendants have already started building the links for afterUnbindChildren hooks.
      // Those hooks are never invoked (because only the initiator can do that), but we still need to clear the list so as to avoid corrupting the next lifecycle.
      clearLinks(initiator);
      return this.beforeBind(initiator, parent, flags);
    } else if ((this.state & State.beforeBindCalled) === State.beforeBindCalled) {
      this.state ^= State.beforeBindCalled;
      this.resolvePromise();
      return;
    }

    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;

    if (initiator.head === null) {
      initiator.head = this as Controller<T>;
    } else {
      initiator.tail!.next = this as Controller<T>;
    }
    initiator.tail = this as Controller<T>;

    if (initiator === this) {
      if (initiator.head !== null) {
        let cur = initiator.head;
        initiator.head = initiator.tail = null;
        let next: Controller<T> | null;

        do {
          ret = cur.afterUnbindChildren(initiator, parent, flags);
          if (ret instanceof Promise) {
            (promises ?? (promises = [])).push(ret);
          }
          next = cur.next;
          cur.next = null;
          cur = next!;
        } while (cur !== null);

        if (promises !== void 0) {
          const promise = promises.length === 1
            ? promises[0]
            : Promise.all(promises) as unknown as Promise<void>;

          return promise.then(() => {
            this.resolvePromise();
          });
        }
      }

      this.resolvePromise();
    }
  }

  private afterUnbindChildren(
    initiator: Controller<T>,
    parent: Controller<T> | null,
    flags: LifecycleFlags,
  ): Promise<void> | void {
    return this.onResolve(
      this.bindingContext?.afterUnbindChildren?.(initiator as IHydratedController<T>, flags),
      () => {
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
              !this.viewFactory!.tryReturnToCache(this as ISyntheticView<T>)
            ) {
              this.dispose();
            }
            break;
          case ViewModelKind.customElement:
            (this.scope as Writable<IScope>).parentScope = null;
            break;
        }

        if ((this.state & State.activating) === State.activating) {
          this.state = (this.state & State.disposed) | State.deactivated;
          return this.activate(this as Controller<T>, parent, flags);
        }

        if ((flags & LifecycleFlags.dispose) === LifecycleFlags.dispose) {
          this.dispose();
        }
        this.state = (this.state & State.disposed) | State.deactivated;
        if (initiator !== this) {
          // For the initiator, the promise is resolved at the end of endDeactivate because that promise resolution
          // has to come after all descendant postEndDeactivate calls resolved. Otherwise, the initiator might resolve
          // while some of its descendants are still busy.
          this.resolvePromise();
        }
      },
    );
  }

  private onResolve(
    maybePromise: Promise<void> | void,
    resolveCallback?: () => Promise<void> | void,
  ): Promise<void> | void {
    if (maybePromise instanceof Promise) {
      if (this.promise === void 0) {
        this.promise = new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
      }
      maybePromise = maybePromise.catch(err => {
        this.logger?.error(err);
        const reject = this.reject;
        this.promise = this.resolve = this.reject = void 0;
        reject!(err);
        throw err;
      });

      return resolveCallback === void 0
        ? maybePromise
        : maybePromise.then(resolveCallback);
    }

    if (resolveCallback !== void 0) {
      return resolveCallback();
    }
  }

  public addBinding(binding: IBinding): void {
    if (this.bindings === void 0) {
      this.bindings = [binding];
    } else {
      this.bindings[this.bindings.length] = binding;
    }
  }

  public addController(controller: Controller<T>): void {
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

  public lockScope(scope: Writable<IScope>): void {
    this.scope = scope;
    this.hasLockedScope = true;
  }

  public setLocation(location: IRenderLocation<T>, mountStrategy: MountStrategy): void {
    this.location = location;
    this.mountStrategy = mountStrategy;
  }

  public release(): void {
    this.state |= State.released;
  }

  public dispose(): void {
    if (this.debug) {
      this.logger!.trace(`dispose()`);
    }

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

    if (this.bindings !== void 0) {
      this.bindings.forEach(callDispose);
      this.bindings = void 0;
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
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    if (visitor(this as IHydratedController<T>) === true) {
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

  private resolvePromise(): void {
    const resolve = this.resolve;
    if (resolve !== void 0) {
      this.promise = this.resolve = this.reject = void 0;
      resolve();
    }
  }
}

function getBindingContext<T extends INode, C extends IViewModel<T>>(flags: LifecycleFlags, instance: object): BindingContext<T, C> {
  if ((instance as IIndexable).noProxy === true || (flags & LifecycleFlags.proxyStrategy) === 0) {
    return instance as BindingContext<T, C>;
  }

  return ProxyObserver.getOrCreate(instance).proxy as unknown as BindingContext<T, C>;
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

function clearLinks<T extends INode>(initiator: Controller<T>): void {
  let cur = initiator.head;
  initiator.head = initiator.tail = null;
  let next: Controller<T> | null;
  while (cur !== null) {
    next = cur.next;
    cur.next = null;
    cur = next;
  }
}

export function isCustomElementController<
  T extends INode = INode,
  C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>,
>(value: unknown): value is ICustomElementController<T, C> {
  return value instanceof Controller && value.vmKind === ViewModelKind.customElement;
}

export function isCustomElementViewModel<
  T extends INode = INode,
>(value: unknown): value is ICustomElementViewModel<T> {
  return isObject(value) && CustomElement.isType(value.constructor);
}
