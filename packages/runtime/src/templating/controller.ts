/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  IContainer,
  IIndexable,
  mergeDistinct,
  nextId,
  Writable,
  Constructable,
  IDisposable,
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
} from './render-context';
import { ChildrenObserver } from './children';

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

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
  afterBindChildren(flags: LifecycleFlags): void;

  beforeUnbind(flags: LifecycleFlags): MaybePromiseOrTask;
  afterUnbind(flags: LifecycleFlags): void;
  afterUnbindChildren(flags: LifecycleFlags): void;

  beforeAttach(flags: LifecycleFlags): void;
  afterAttach(flags: LifecycleFlags): MaybePromiseOrTask;
  afterAttachChildren(flags: LifecycleFlags): void;

  beforeDetach(flags: LifecycleFlags): void;
  afterDetach(flags: LifecycleFlags): void;
  afterDetachChildren(flags: LifecycleFlags): void;

  dispose(): void;
}>;

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
export class Controller<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>,
> implements IController<T, C> {
  public readonly id: number = nextId('au$component');

  public nextBound: IController<T, C> | undefined = void 0;
  public nextUnbound: IController<T, C> | undefined = void 0;

  public nextAttached: IController<T, C> | undefined = void 0;
  public nextDetached: IController<T, C> | undefined = void 0;

  public parent: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined = void 0;
  public bindings: IBinding[] | undefined = void 0;
  public controllers: IController<T>[] | undefined = void 0;

  public isBound: boolean = false;
  public isAttached: boolean = false;
  public hasLockedScope: boolean = false;
  public isReleased: boolean = false;

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

    return controller as unknown as ISyntheticView<T>;
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
    this.hasLockedScope = true;
  }

  public setLocation(location: IRenderLocation<T>, mountStrategy: MountStrategy): void {
    this.location = location;
    this.mountStrategy = mountStrategy;
  }

  public release(): void {
    this.isReleased = true;
  }

  public afterBindChildren(flags: LifecycleFlags): void {
    this.bindingContext!.afterBindChildren(flags); // non-null is implied by the hook
  }

  public afterUnbindChildren(flags: LifecycleFlags): void {
    this.bindingContext!.afterUnbindChildren(flags); // non-null is implied by the hook
  }

  public afterAttachChildren(flags: LifecycleFlags): void {
    this.bindingContext!.afterAttachChildren(flags); // non-null is implied by the hook
  }

  public afterDetachChildren(flags: LifecycleFlags): void {
    this.bindingContext!.afterDetachChildren(flags); // non-null is implied by the hook
  }

  public dispose(): void {
    if (this.hooks.hasDispose) {
      this.bindingContext!.dispose();
    }

    this.controllers?.forEach(dispose);
    this.controllers = void 0;

    this.bindings?.forEach(dispose);
    this.bindings = void 0;

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

  public bind(flags: LifecycleFlags, scope?: IScope, part?: string): ILifecycleTask {
    if (this.isBound) {
      return LifecycleTask.done;
    }

    this.isBound = true;
    this.part = part;
    flags |= LifecycleFlags.fromBind;

    switch (this.vmKind) {
      case ViewModelKind.customElement: {
        const $scope = this.scope as Writable<IScope>;
        $scope.parentScope = scope === void 0 ? null : scope;
        $scope.scopeParts = this.scopeParts!;

        this.lifecycle.afterBindChildren.begin();

        if (this.hooks.hasBeforeBind) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeBind(flags);
          if (hasAsyncWork(ret)) {
            // this.scope could be reassigned during beforeBind so reference that instead of $scope.
            return new ContinuationTask(ret, this.bindBindings, this, flags, this.scope!);
          }
        }

        return this.bindBindings(flags, this.scope!);
      }
      case ViewModelKind.customAttribute: {
        this.scope = scope;
        this.lifecycle.afterBindChildren.begin();

        if (this.hooks.hasBeforeBind) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeBind(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.endBind, this, flags);
          }
        }

        this.endBind(flags);
        return LifecycleTask.done;
      }
      case ViewModelKind.synthetic: {
        if (scope == void 0) {
          throw new Error(`Scope is null or undefined`); // TODO: create error code
        }

        (scope as Writable<IScope>).scopeParts = mergeDistinct(scope.scopeParts, this.scopeParts, false);

        this.isReleased = false;
        if (!this.hasLockedScope) {
          this.scope = scope;
        }

        this.lifecycle.afterBindChildren.begin();
        return this.bindBindings(flags, this.scope!);
      }
    }
  }

  private bindBindings(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    if (this.bindings !== void 0) {
      if (this.isStrictBinding) {
        flags |= LifecycleFlags.isStrictBindingStrategy;
      }
      for (const binding of this.bindings) {
        binding.$bind(flags, scope, this.part);
      }
    }

    // This can only be a customElement, so we don't need to check the vmKind
    if (this.hooks.hasAfterBind) {
      (this.bindingContext as BindingContext<T, C>).afterBind(flags);
    }

    return this.bindControllers(flags, this.scope!);
  }

  private bindControllers(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    if (this.controllers !== void 0) {
      for (const controller of this.controllers) {
        controller.parent = this as unknown as IHydratedController<T>;
        task = controller.bind(flags, scope, this.part);
        if (!task.done) {
          (tasks ?? (tasks = [])).push(task);
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
    // This can be a customElement or customAttribute. If this is a customElement, bindBindings() will have already called this hook, hence the vmKind check.
    if (this.hooks.hasAfterBind && this.vmKind === ViewModelKind.customAttribute) {
      (this.bindingContext as BindingContext<T, C>).afterBind(flags);
    }
    if (this.hooks.hasAfterBindChildren) {
      this.lifecycle.afterBindChildren.add(this);
    }
    this.lifecycle.afterBindChildren.end(flags);
  }

  public unbind(flags: LifecycleFlags): ILifecycleTask {
    if (!this.isBound) {
      return LifecycleTask.done;
    }

    this.isBound = false;
    flags |= LifecycleFlags.fromUnbind;

    switch (this.vmKind) {
      case ViewModelKind.customElement: {
        (this.scope as Writable<IScope>).parentScope = null;

        this.lifecycle.afterUnbindChildren.begin();

        if (this.hooks.hasBeforeUnbind) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeUnbind(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.unbindBindings, this, flags);
          }
        }

        return this.unbindBindings(flags);
      }
      case ViewModelKind.customAttribute: {
        this.lifecycle.afterUnbindChildren.begin();

        if (this.hooks.hasBeforeUnbind) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeUnbind(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.endUnbind, this, flags);
          }
        }

        this.endUnbind(flags);
        return LifecycleTask.done;
      }
      case ViewModelKind.synthetic: {
        this.lifecycle.afterUnbindChildren.begin();

        return this.unbindBindings(flags);
      }
    }
  }

  private unbindBindings(flags: LifecycleFlags): ILifecycleTask {
    if (this.bindings !== void 0) {
      for (const binding of this.bindings) {
        binding.$unbind(flags);
      }
    }

    // This can only be a customElement, so we don't need to check the vmKind
    if (this.hooks.hasAfterUnbind) {
      (this.bindingContext as BindingContext<T, C>).afterUnbind(flags);
    }

    return this.unbindControllers(flags);
  }

  private unbindControllers(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    if (this.controllers !== void 0) {
      for (const controller of this.controllers) {
        task = controller.unbind(flags);
        controller.parent = void 0;
        if (!task.done) {
          (tasks ?? (tasks = [])).push(task);
        }
      }
    }

    if (tasks === void 0) {
      this.endUnbind(flags);
      return LifecycleTask.done;
    }
    return new AggregateContinuationTask(tasks, this.endUnbind, this, flags);
  }

  private endUnbind(flags: LifecycleFlags): void {
    switch (this.vmKind) {
      case ViewModelKind.customAttribute:
        this.scope = void 0;
        break;
      case ViewModelKind.synthetic:
        if (!this.hasLockedScope) {
          this.scope = void 0;
        }

        if (
          this.isReleased &&
          !this.viewFactory!.tryReturnToCache(this as unknown as ISyntheticView<T>)
        ) {
          this.dispose();
        }
    }

    // This can be a customElement or customAttribute. If this is a customElement, bindBindings() will have already called this hook, hence the vmKind check.
    if (this.hooks.hasAfterBind && this.vmKind === ViewModelKind.customAttribute) {
      (this.bindingContext as BindingContext<T, C>).afterUnbind(flags);
    }
    if (this.hooks.hasAfterUnbindChildren) {
      this.lifecycle.afterUnbindChildren.add(this);
    }

    this.lifecycle.afterUnbindChildren.end(flags);
  }

  public attach(flags: LifecycleFlags): ILifecycleTask {
    if (this.isAttached) {
      return LifecycleTask.done;
    }

    this.isAttached = true;
    flags |= LifecycleFlags.fromAttach;
    switch (this.vmKind) {
      case ViewModelKind.customElement: {
        this.lifecycle.afterAttachChildren.begin();

        if (this.hooks.hasBeforeAttach) {
          (this.bindingContext as BindingContext<T, C>).beforeAttach(flags);
        }

        this.projector!.project(this.nodes!);

        if (this.hooks.hasAfterAttach) {
          const ret = (this.bindingContext as BindingContext<T, C>).afterAttach(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.attachControllers, this, flags);
          }
        }

        return this.attachControllers(flags);
      }
      case ViewModelKind.customAttribute: {
        this.lifecycle.afterAttachChildren.begin();

        if (this.hooks.hasBeforeAttach) {
          (this.bindingContext as BindingContext<T, C>).beforeAttach(flags);
        }

        if (this.hooks.hasAfterAttach) {
          const ret = (this.bindingContext as BindingContext<T, C>).afterAttach(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.endAttach, this, flags);
          }
        }

        this.endAttach(flags);
        return LifecycleTask.done;
      }
      case ViewModelKind.synthetic: {
        this.lifecycle.afterAttachChildren.begin();

        switch (this.mountStrategy) {
          case MountStrategy.append:
            this.nodes!.appendTo(this.location! as T);
            break;
          case MountStrategy.insertBefore:
            this.nodes!.insertBefore(this.location!);
            break;
        }

        return this.attachControllers(flags);
      }
    }
  }

  private attachControllers(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    if (this.controllers !== void 0) {
      for (const controller of this.controllers) {
        controller.parent = this as unknown as IHydratedController<T>;
        task = controller.attach(flags);
        if (!task.done) {
          (tasks ?? (tasks = [])).push(task);
        }
      }
    }

    if (tasks === void 0) {
      this.endAttach(flags);
      return LifecycleTask.done;
    }
    return new AggregateContinuationTask(tasks, this.endAttach, this, flags);
  }

  private endAttach(flags: LifecycleFlags): void {
    if (this.hooks.hasAfterAttachChildren) {
      this.lifecycle.afterAttachChildren.add(this);
    }
    this.lifecycle.afterAttachChildren.end(flags);
  }

  public detach(flags: LifecycleFlags): ILifecycleTask {
    if (!this.isAttached) {
      return LifecycleTask.done;
    }

    this.isAttached = false;
    flags |= LifecycleFlags.fromDetach;

    this.lifecycle.afterDetachChildren.begin();

    switch (this.vmKind) {
      case ViewModelKind.customElement:
        if (this.hooks.hasBeforeDetach) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeDetach(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.afterDetachCustomElement, this, flags);
          }
        }

        return this.afterDetachCustomElement(flags);
      case ViewModelKind.customAttribute:
        if (this.hooks.hasBeforeDetach) {
          const ret = (this.bindingContext as BindingContext<T, C>).beforeDetach(flags);
          if (hasAsyncWork(ret)) {
            return new ContinuationTask(ret, this.afterDetachCustomAttribute, this, flags);
          }
        }

        this.afterDetachCustomAttribute(flags);
        return LifecycleTask.done;
      case ViewModelKind.synthetic:
        this.nodes!.remove(); // non-null is implied by the hook
        this.nodes!.unlink();

        return this.detachControllers(flags);
    }
  }

  private afterDetachCustomElement(flags: LifecycleFlags): ILifecycleTask {
    this.projector!.take(this.nodes!); // non-null is implied by the hook

    if (this.hooks.hasAfterDetach) {
      (this.bindingContext as BindingContext<T, C>).afterDetach(flags);
    }

    return this.detachControllers(flags);
  }

  private afterDetachCustomAttribute(flags: LifecycleFlags): void {
    if (this.hooks.hasAfterDetach) {
      (this.bindingContext as BindingContext<T, C>).afterDetach(flags);
    }

    this.endDetach(flags);
  }

  private detachControllers(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    if (this.controllers !== void 0) {
      for (const controller of this.controllers) {
        controller.parent = this as unknown as IHydratedController<T>;
        task = controller.detach(flags);
        if (!task.done) {
          (tasks ?? (tasks = [])).push(task);
        }
      }
    }

    if (tasks === void 0) {
      this.endDetach(flags);
      return LifecycleTask.done;
    }
    return new AggregateContinuationTask(tasks, this.endDetach, this, flags);
  }

  private endDetach(flags: LifecycleFlags): void {
    if (this.hooks.hasAfterDetachChildren) {
      this.lifecycle.afterDetachChildren.add(this);
    }
    this.lifecycle.afterDetachChildren.end(flags);
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
