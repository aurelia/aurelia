import {
  IContainer,
  IIndexable,
  mergeDistinct,
  nextId,
  Writable,
  Constructable,
} from '@aurelia/kernel';
import {
  PropertyBinding,
} from '../binding/property-binding';
import {
  HooksDefinition,
  PartialCustomElementDefinitionParts,
} from '../definitions';
import {
  INode,
  INodeSequence,
  IRenderLocation
} from '../dom';
import {
  LifecycleFlags,
  State
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
  IHydratedController,
  ICustomElementViewModel,
  ICustomAttributeViewModel,
} from '../lifecycle';
import {
  AggregateContinuationTask,
  ContinuationTask,
  hasAsyncWork,
  ILifecycleTask,
  LifecycleTask,
  MaybePromiseOrTask,
} from '../lifecycle-task';
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
  PartialCustomElementDefinition,
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
  ICompiledRenderContext,
} from './render-context';
import { ChildrenObserver } from './children';

type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & {
  create(
    controller: IController,
    definition: CustomElementDefinition,
    parentContainer: IContainer,
    parts: PartialCustomElementDefinitionParts | undefined,
    flags: LifecycleFlags,
  ): PartialCustomElementDefinition | void;
  beforeCompile(
    controller: IController,
    definition: CustomElementDefinition,
    container: IContainer,
    parts: PartialCustomElementDefinitionParts | undefined,
    flags: LifecycleFlags,
  ): void;
  afterCompile(
    controller: IController,
    compiledDefinition: CustomElementDefinition,
    projector: IElementProjector,
    nodes: INodeSequence | null,
    flags: LifecycleFlags,
  ): void;
  afterCompileChildren(
    children: readonly IController[] | undefined,
    flags: LifecycleFlags,
  ): void;

  beforeBind(flags: LifecycleFlags): MaybePromiseOrTask;
  afterBind(flags: LifecycleFlags): void;

  beforeUnbind(flags: LifecycleFlags): MaybePromiseOrTask;
  afterUnbind(flags: LifecycleFlags): void;

  beforeAttach(flags: LifecycleFlags): void;
  afterAttach(flags: LifecycleFlags): void;

  beforeDetach(flags: LifecycleFlags): void;
  afterDetach(flags: LifecycleFlags): void;

  caching(flags: LifecycleFlags): void;
}>;

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
export class Controller<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>,
> implements IController<T, C> {
  public readonly id: number = nextId('au$component');

  public nextBound: IController<T, C> | undefined = void 0;
  public nextUnbound: IController<T, C> | undefined = void 0;
  public prevBound: IController<T, C> | undefined = void 0;
  public prevUnbound: IController<T, C> | undefined = void 0;

  public nextAttached: IController<T, C> | undefined = void 0;
  public nextDetached: IController<T, C> | undefined = void 0;
  public prevAttached: IController<T, C> | undefined = void 0;
  public prevDetached: IController<T, C> | undefined = void 0;

  public nextMount: IController<T, C> | undefined = void 0;
  public nextUnmount: IController<T, C> | undefined = void 0;
  public prevMount: IController<T, C> | undefined = void 0;
  public prevUnmount: IController<T, C> | undefined = void 0;

  public parent: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined = void 0;
  public bindings: IBinding[] | undefined = void 0;
  public controllers: IController<T>[] | undefined = void 0;

  public state: State = State.none;

  public scopeParts: string[] | undefined = void 0;
  public isStrictBinding: boolean = false;

  public scope: IScope | undefined = void 0;
  public part: string | undefined = void 0;
  public projector: IElementProjector | undefined = void 0;

  public nodes: INodeSequence<T> | undefined = void 0;
  public context: IRenderContext<T> | undefined = void 0;
  public location: IRenderLocation<T> | undefined = void 0;
  public mountStrategy: MountStrategy = MountStrategy.insertBefore;

  public constructor(
    public readonly vmKind: ViewModelKind,
    public flags: LifecycleFlags,
    public readonly lifecycle: ILifecycle,
    public hooks: HooksDefinition,
    /**
     * The viewFactory. Only present for synthetic views.
     */
    public readonly viewFactory: IViewFactory<T> | undefined,
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    public readonly viewModel: C | undefined,
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    public readonly bindingContext: BindingContext<T, C> | undefined,
    /**
     * The physical host dom node. Only present for custom elements.
     */
    public readonly host: T | undefined,
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
    parts: PartialCustomElementDefinitionParts | undefined,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): ICustomElementController<T, C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as unknown as ICustomElementController<T, C>;
    }

    const definition = CustomElement.getDefinition(viewModel.constructor as Constructable);
    flags |= definition.strategy;

    const controller = new Controller<T, C>(
      /* vmKind         */ViewModelKind.customElement,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* hooks          */definition.hooks,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<T, C>(flags, viewModel),
      /* host           */host,
    );

    controllerLookup.set(viewModel, controller as Controller<INode, IViewModel>);

    controller.hydrateCustomElement(definition, parentContainer, parts);

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
      /* hooks          */definition.hooks,
      /* viewFactory    */void 0,
      /* viewModel      */viewModel,
      /* bindingContext */getBindingContext<T, C>(flags, viewModel),
      /* host           */host
    );

    controllerLookup.set(viewModel, controller as Controller<INode, IViewModel>);

    controller.hydrateCustomAttribute(definition);

    return controller as unknown as ICustomAttributeController<T, C>;
  }

  public static forSyntheticView<
    T extends INode = INode,
  >(
    viewFactory: IViewFactory<T>,
    lifecycle: ILifecycle,
    context: IRenderContext<T>,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): ISyntheticView<T> {
    const controller = new Controller<T>(
      /* vmKind         */ViewModelKind.synthetic,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* hooks          */HooksDefinition.none,
      /* viewFactory    */viewFactory,
      /* viewModel      */void 0,
      /* bindingContext */void 0,
      /* host           */void 0,
    );

    controller.hydrateSynthetic(context, viewFactory.parts);

    return controller as Controller<T> & { context: ICompiledRenderContext<T> } as ISyntheticView<T>;
  }

  private hydrateCustomElement(
    definition: CustomElementDefinition,
    parentContainer: IContainer,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    const flags = this.flags |= definition.strategy;
    const instance = this.viewModel as ICustomElementViewModel<T>;
    createObservers(this.lifecycle, definition, flags, instance);
    createChildrenObservers(this as unknown as IDryCustomElementController<T, NonNullable<C>>, definition, flags, instance);

    this.scope = Scope.create(flags, this.bindingContext!, null);

    const hooks = this.hooks;
    if (hooks.hasCreate) {
      const result = instance.create!(
        /* controller      */this as unknown as IDryCustomElementController<T, ICustomElementViewModel<T>>,
        /* parentContainer */parentContainer,
        /* definition      */definition,
        /* parts           */parts,
      );
      if (result !== void 0 && result !== definition) {
        definition = CustomElementDefinition.getOrCreate(result);
      }
    }

    const context = this.context = getRenderContext<T>(definition, parentContainer, parts);
    // Support Recursive Components by adding self to own context
    definition.register(context);
    if (definition.injectable !== null) {
      // If the element is registered as injectable, support injecting the instance into children
      context.beginChildComponentOperation(instance);
    }

    if (hooks.hasBeforeCompile) {
      instance.beforeCompile!(
        this as unknown as IContextualCustomElementController<T, ICustomElementViewModel<T>>,
      );
    }

    const compiledContext = context.compile();
    const compiledDefinition = compiledContext.compiledDefinition;

    this.scopeParts = compiledDefinition.scopeParts;
    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const projectorLocator = parentContainer.get(IProjectorLocator);

    this.projector = projectorLocator.getElementProjector(
      context.dom,
      this as unknown as ICustomElementController<T>,
      this.host!,
      compiledDefinition,
    );

    (instance as Writable<C>).$controller = this as unknown as IDryCustomElementController<T, NonNullable<C>>;
    const nodes = this.nodes = compiledContext.createNodes();

    if (hooks.hasAfterCompile) {
      instance.afterCompile!(
        this as unknown as ICompiledCustomElementController<T, ICustomElementViewModel<T>>,
      );
    }

    const targets = nodes.findTargets();
    compiledContext.render(
      /* flags      */this.flags,
      /* controller */this,
      /* targets    */targets,
      /* definition */compiledDefinition,
      /* host       */this.host,
      /* parts      */parts,
    );

    if (hooks.hasAfterCompileChildren) {
      instance.afterCompileChildren!(
        this as unknown as ICustomElementController<T>,
      );
    }
  }

  private hydrateCustomAttribute(definition: CustomAttributeDefinition): void {
    const flags = this.flags | definition.strategy;
    const instance = this.viewModel!;
    createObservers(this.lifecycle, definition, flags, instance);

    (instance as Writable<C>).$controller = this;
  }

  private hydrateSynthetic(
    context: IRenderContext<T>,
    parts: PartialCustomElementDefinitionParts | undefined,
  ): void {
    this.context = context;
    const compiledContext = context.compile();
    const compiledDefinition = compiledContext.compiledDefinition;

    this.scopeParts = compiledDefinition.scopeParts;
    this.isStrictBinding = compiledDefinition.isStrictBinding;

    const nodes = this.nodes = compiledContext.createNodes();
    const targets = nodes.findTargets();
    compiledContext.render(
      /* flags      */this.flags,
      /* controller */this,
      /* targets    */targets,
      /* definition */compiledDefinition,
      /* host       */void 0,
      /* parts      */parts,
    );
  }

  public addBinding(binding: IBinding): void {
    if (this.bindings === void 0) {
      this.bindings = [binding];
    } else {
      this.bindings[this.bindings.length] = binding;
    }
  }

  public addController(controller: IController<T>): void {
    if (this.controllers === void 0) {
      this.controllers = [controller];
    } else {
      this.controllers[this.controllers.length] = controller;
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

  public lockScope(scope: IScope): void {
    this.scope = scope;
    this.state |= State.hasLockedScope;
  }

  public hold(location: IRenderLocation<T>, mountStrategy: MountStrategy): void {
    this.state = (this.state | State.canBeCached) ^ State.canBeCached;
    this.location = location;
    this.mountStrategy = mountStrategy;
  }

  public release(flags: LifecycleFlags): boolean {
    this.state |= State.canBeCached;
    if ((this.state & State.isAttached) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.viewFactory!.canReturnToCache(this as unknown as ISyntheticView<T>); // non-null is implied by the hook
    }

    return this.unmountSynthetic(flags);
  }

  public bind(flags: LifecycleFlags, scope?: IScope, part?: string): ILifecycleTask {
    this.part = part;
    // TODO: benchmark which of these techniques is fastest:
    // - the current one (enum with switch)
    // - set the name of the method in the constructor, e.g. this.bindMethod = 'bindCustomElement'
    //    and then doing this[this.bindMethod](flags, scope) instead of switch (eliminates branching
    //    but computed property access might be harmful to browser optimizations)
    // - make bind() a property and set it to one of the 3 methods in the constructor,
    //    e.g. this.bind = this.bindCustomElement (eliminates branching + reduces call stack depth by 1,
    //    but might make the call site megamorphic)
    flags |= LifecycleFlags.fromBind;
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        return this.bindCustomElement(flags, scope);
      case ViewModelKind.customAttribute:
        return this.bindCustomAttribute(flags, scope);
      case ViewModelKind.synthetic:
        return this.bindSynthetic(flags, scope);
    }
  }

  public unbind(flags: LifecycleFlags): ILifecycleTask {
    flags |= LifecycleFlags.fromUnbind;
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        return this.unbindCustomElement(flags);
      case ViewModelKind.customAttribute:
        return this.unbindCustomAttribute(flags);
      case ViewModelKind.synthetic:
        return this.unbindSynthetic(flags);
    }
  }

  public afterBind(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.afterBind(flags); // non-null is implied by the hook
  }

  public afterUnbind(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.afterUnbind(flags); // non-null is implied by the hook
  }

  public attach(flags: LifecycleFlags): void {
    if ((this.state & State.isAttachedOrAttaching) > 0 && (flags & LifecycleFlags.reorderNodes) === 0) {
      return;
    }

    flags |= LifecycleFlags.fromAttach;
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.attachCustomElement(flags);
        break;
      case ViewModelKind.customAttribute:
        this.attachCustomAttribute(flags);
        break;
      case ViewModelKind.synthetic:
        this.attachSynthetic(flags);
    }
  }

  public detach(flags: LifecycleFlags): void {
    if ((this.state & State.isAttachedOrAttaching) === 0) {
      return;
    }

    flags |= LifecycleFlags.fromDetach;
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.detachCustomElement(flags);
        break;
      case ViewModelKind.customAttribute:
        this.detachCustomAttribute(flags);
        break;
      case ViewModelKind.synthetic:
        this.detachSynthetic(flags);
    }
  }

  public afterAttach(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.afterAttach(flags); // non-null is implied by the hook
  }

  public afterDetach(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.afterDetach(flags); // non-null is implied by the hook
  }

  public mount(flags: LifecycleFlags): void {
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.mountCustomElement(flags);
        break;
      case ViewModelKind.synthetic:
        this.mountSynthetic(flags);
    }
  }

  public unmount(flags: LifecycleFlags): void {
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.unmountCustomElement(flags);
        break;
      case ViewModelKind.synthetic:
        this.unmountSynthetic(flags);
    }
  }

  public cache(flags: LifecycleFlags): void {
    switch (this.vmKind) {
      case ViewModelKind.customElement:
        this.cacheCustomElement(flags);
        break;
      case ViewModelKind.customAttribute:
        this.cacheCustomAttribute(flags);
        break;
      case ViewModelKind.synthetic:
        this.cacheSynthetic(flags);
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

  // #region bind/unbind
  private bindCustomElement(flags: LifecycleFlags, scope?: IScope): ILifecycleTask {
    const $scope = this.scope as Writable<IScope>;

    $scope.parentScope = scope === void 0 ? null : scope;
    $scope.scopeParts = this.scopeParts!;

    if ((this.state & State.isBound) > 0) {
      return LifecycleTask.done;
    }

    flags |= LifecycleFlags.fromBind;

    this.state |= State.isBinding;

    this.lifecycle.afterBind.begin();

    if (this.hooks.hasBeforeBind) {
      const ret = (this.bindingContext as BindingContext<T, C>).beforeBind(flags);
      if (hasAsyncWork(ret)) {
        // this.scope could be reassigned during beforeBind so reference that instead of $scope.
        return new ContinuationTask(ret, this.bindBindings, this, flags, this.scope!);
      }
    }

    return this.bindBindings(flags, this.scope!);
  }

  private bindCustomAttribute(flags: LifecycleFlags, scope?: IScope): ILifecycleTask {
    if ((this.state & State.isBound) > 0) {
      if (this.scope === scope) {
        return LifecycleTask.done;
      }

      flags |= LifecycleFlags.fromBind;
      const task = this.unbind(flags);

      if (!task.done) {
        return new ContinuationTask(task, this.bind, this, flags, scope);
      }
    } else {
      flags |= LifecycleFlags.fromBind;
    }

    this.state |= State.isBinding;

    this.scope = scope;
    this.lifecycle.afterBind.begin();

    if (this.hooks.hasBeforeBind) {
      const ret = (this.bindingContext as BindingContext<T, C>).beforeBind(flags);
      if (hasAsyncWork(ret)) {
        return new ContinuationTask(ret, this.endBind, this, flags);
      }
    }

    this.endBind(flags);
    return LifecycleTask.done;
  }

  private bindSynthetic(flags: LifecycleFlags, scope?: IScope): ILifecycleTask {
    if (scope == void 0) {
      throw new Error(`Scope is null or undefined`); // TODO: create error code
    }

    (scope as Writable<IScope>).scopeParts = mergeDistinct(scope.scopeParts, this.scopeParts, false);

    if ((this.state & State.isBound) > 0) {
      if (this.scope === scope || (this.state & State.hasLockedScope) > 0) {
        return LifecycleTask.done;
      }

      flags |= LifecycleFlags.fromBind;
      const task = this.unbind(flags);

      if (!task.done) {
        return new ContinuationTask(task, this.bind, this, flags, scope);
      }
    } else {
      flags |= LifecycleFlags.fromBind;
    }

    if ((this.state & State.hasLockedScope) === 0) {
      this.scope = scope;
    }

    this.state |= State.isBinding;

    this.lifecycle.afterBind.begin();
    return this.bindBindings(flags, this.scope!);
  }

  private bindBindings(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    const { bindings } = this;
    if (bindings !== void 0) {
      const { length } = bindings;
      if (this.isStrictBinding) {
        flags |= LifecycleFlags.isStrictBindingStrategy;
      }
      for (let i = 0; i < length; ++i) {
        bindings[i].$bind(flags, scope, this.part);
      }
    }

    return this.bindControllers(flags, this.scope!);
  }

  private bindControllers(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    const { controllers } = this;
    if (controllers !== void 0) {
      const { length } = controllers;
      for (let i = 0; i < length; ++i) {
        controllers[i].parent = this as unknown as IHydratedController<T>;
        task = controllers[i].bind(flags, scope, this.part);
        if (!task.done) {
          if (tasks === void 0) {
            tasks = [];
          }
          tasks.push(task);
        }
      }
    }

    if (tasks === void 0) {
      this.endBind(flags);
      return LifecycleTask.done;
    }
    return new AggregateContinuationTask(tasks, this.endBind, this, flags);
  }

  private endBind(flags: LifecycleFlags): void {
    if (this.hooks.hasAfterBind) {
      this.lifecycle.afterBind.add(this);
    }
    this.state = this.state ^ State.isBinding | State.isBound;
    this.lifecycle.afterBind.end(flags);
  }

  private unbindCustomElement(flags: LifecycleFlags): ILifecycleTask {
    if ((this.state & State.isBound) === 0) {
      return LifecycleTask.done;
    }

    (this.scope as Writable<IScope>).parentScope = null;

    this.state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.afterUnbind.begin();

    if (this.hooks.hasBeforeUnbind) {
      const ret = (this.bindingContext as BindingContext<T, C>).beforeUnbind(flags);
      if (hasAsyncWork(ret)) {
        return new ContinuationTask(ret, this.unbindControllers, this, flags);
      }
    }

    return this.unbindControllers(flags);
  }

  private unbindCustomAttribute(flags: LifecycleFlags): ILifecycleTask {
    if ((this.state & State.isBound) === 0) {
      return LifecycleTask.done;
    }

    this.state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.afterUnbind.begin();

    if (this.hooks.hasBeforeUnbind) {
      const ret = (this.bindingContext as BindingContext<T, C>).beforeUnbind(flags);
      if (hasAsyncWork(ret)) {
        return new ContinuationTask(ret, this.endUnbind, this, flags);
      }
    }

    this.endUnbind(flags);
    return LifecycleTask.done;
  }

  private unbindSynthetic(flags: LifecycleFlags): ILifecycleTask {
    if ((this.state & State.isBound) === 0) {
      return LifecycleTask.done;
    }

    this.state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.afterUnbind.begin();

    return this.unbindControllers(flags);
  }

  private unbindBindings(flags: LifecycleFlags): void {
    const { bindings } = this;
    if (bindings !== void 0) {
      for (let i = bindings.length - 1; i >= 0; --i) {
        bindings[i].$unbind(flags);
      }
    }
    this.endUnbind(flags);
  }

  private unbindControllers(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    const { controllers } = this;
    if (controllers !== void 0) {
      for (let i = controllers.length - 1; i >= 0; --i) {
        task = controllers[i].unbind(flags);
        controllers[i].parent = void 0;
        if (!task.done) {
          if (tasks === void 0) {
            tasks = [];
          }
          tasks.push(task);
        }
      }
    }

    if (tasks === void 0) {
      this.unbindBindings(flags);
      return LifecycleTask.done;
    }
    return new AggregateContinuationTask(tasks, this.unbindBindings, this, flags);
  }

  private endUnbind(flags: LifecycleFlags): void {
    switch (this.vmKind) {
      case ViewModelKind.customAttribute:
        this.scope = void 0;
        break;
      case ViewModelKind.synthetic:
        if ((this.state & State.hasLockedScope) === 0) {
          this.scope = void 0;
        }
    }
    if (this.hooks.hasAfterUnbind) {
      this.lifecycle.afterUnbind.add(this);
    }

    this.state = (this.state | State.isBoundOrUnbinding) ^ State.isBoundOrUnbinding;
    this.lifecycle.afterUnbind.end(flags);
  }
  // #endregion

  // #region attach/detach
  private attachCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.mount.add(this);
    this.lifecycle.afterAttach.begin();

    if (this.hooks.hasBeforeAttach) {
      (this.bindingContext as BindingContext<T, C>).beforeAttach(flags);
    }

    this.attachControllers(flags);

    if (this.hooks.hasAfterAttach) {
      this.lifecycle.afterAttach.add(this);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
    this.lifecycle.afterAttach.end(flags);
  }

  private attachCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.afterAttach.begin();

    if (this.hooks.hasBeforeAttach) {
      (this.bindingContext as BindingContext<T, C>).beforeAttach(flags);
    }

    if (this.hooks.hasAfterAttach) {
      this.lifecycle.afterAttach.add(this);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
    this.lifecycle.afterAttach.end(flags);
  }

  private attachSynthetic(flags: LifecycleFlags): void {
    if (((this.state & State.isAttached) > 0 && flags & LifecycleFlags.reorderNodes) > 0) {
      this.lifecycle.mount.add(this);
    } else {
      flags |= LifecycleFlags.fromAttach;
      this.state |= State.isAttaching;

      this.lifecycle.mount.add(this);
      this.lifecycle.afterAttach.begin();

      this.attachControllers(flags);

      this.state = this.state ^ State.isAttaching | State.isAttached;
      this.lifecycle.afterAttach.end(flags);
    }
  }

  private detachCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.afterDetach.begin();
    this.lifecycle.unmount.add(this);

    if (this.hooks.hasBeforeDetach) {
      (this.bindingContext as BindingContext<T, C>).beforeDetach(flags);
    }

    this.detachControllers(flags);

    if (this.hooks.hasAfterDetach) {
      this.lifecycle.afterDetach.add(this);
    }

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.afterDetach.end(flags);
  }

  private detachCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.afterDetach.begin();

    if (this.hooks.hasBeforeDetach) {
      (this.bindingContext as BindingContext<T, C>).beforeDetach(flags);
    }

    if (this.hooks.hasAfterDetach) {
      this.lifecycle.afterDetach.add(this);
    }

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.afterDetach.end(flags);
  }

  private detachSynthetic(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.afterDetach.begin();
    this.lifecycle.unmount.add(this);

    this.detachControllers(flags);

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.afterDetach.end(flags);
  }

  private attachControllers(flags: LifecycleFlags): void {
    const { controllers } = this;
    if (controllers !== void 0) {
      const { length } = controllers;
      for (let i = 0; i < length; ++i) {
        controllers[i].attach(flags);
      }
    }
  }

  private detachControllers(flags: LifecycleFlags): void {
    const { controllers } = this;
    if (controllers !== void 0) {
      for (let i = controllers.length - 1; i >= 0; --i) {
        controllers[i].detach(flags);
      }
    }
  }
  // #endregion

  // #region mount/unmount/cache
  private mountCustomElement(flags: LifecycleFlags): void {
    if ((this.state & State.isMounted) > 0) {
      return;
    }

    this.state |= State.isMounted;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.projector!.project(this.nodes!); // non-null is implied by the hook
  }

  private mountSynthetic(flags: LifecycleFlags): void {
    const nodes = this.nodes!; // non null is implied by the hook
    const location = this.location!; // non null is implied by the hook
    this.state |= State.isMounted;

    switch (this.mountStrategy) {
      case MountStrategy.append:
        nodes.appendTo(location as T);
        break;
      default:
        nodes.insertBefore(location);
    }
  }

  private unmountCustomElement(flags: LifecycleFlags): void {
    if ((this.state & State.isMounted) === 0) {
      return;
    }

    this.state = (this.state | State.isMounted) ^ State.isMounted;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.projector!.take(this.nodes!); // non-null is implied by the hook
  }

  private unmountSynthetic(flags: LifecycleFlags): boolean {
    if ((this.state & State.isMounted) === 0) {
      return false;
    }

    this.state = (this.state | State.isMounted) ^ State.isMounted;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.nodes!.remove(); // non-null is implied by the hook
    this.nodes!.unlink();

    if ((this.state & State.canBeCached) > 0) {
      this.state = (this.state | State.canBeCached) ^ State.canBeCached;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.viewFactory!.tryReturnToCache(this as unknown as ISyntheticView<T>)) { // non-null is implied by the hook
        return true;
      }
    }
    return false;
  }

  private cacheCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromCache;
    if (this.hooks.hasCaching) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.bindingContext!.caching(flags); // non-null is implied by the hook
    }
  }

  private cacheCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromCache;
    if (this.hooks.hasCaching) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.bindingContext!.caching(flags); // non-null is implied by the hook
    }

    const { controllers } = this;
    if (controllers !== void 0) {
      const { length } = controllers;
      for (let i = length - 1; i >= 0; --i) {
        controllers[i].cache(flags);
      }
    }
  }

  private cacheSynthetic(flags: LifecycleFlags): void {
    const { controllers } = this;
    if (controllers !== void 0) {
      const { length } = controllers;
      for (let i = length - 1; i >= 0; --i) {
        controllers[i].cache(flags);
      }
    }
  }
  // #endregion
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
  controller: IController,
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
          controller as unknown as ICustomElementController,
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
