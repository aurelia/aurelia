import {
  IContainer,
  IIndexable,
  IServiceLocator,
  mergeDistinct,
  nextId,
  PLATFORM,
  Writable,
} from '@aurelia/kernel';
import {
  PropertyBinding,
} from '../binding/property-binding';
import {
  HooksDefinition,
  IAttributeDefinition,
  IBindableDescription,
  IChildrenObserverDescription,
  IElementHydrationOptions,
  IHydrateElementInstruction,
  IHydrateTemplateController,
  ITemplateDefinition,
  TemplateDefinition
} from '../definitions';
import {
  IDOM,
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
  IRenderContext,
  IViewCache,
  IViewModel,
  ViewModelKind
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
  SelfObserver,
} from '../observation/self-observer';
import {
  ChildrenObserver,
  IRenderingEngine,
  ITemplate,
} from '../rendering-engine';
import {
  ICustomElementType,
  IElementProjector,
  IProjectorLocator
} from '../resources/custom-element';

type Description = Required<IAttributeDefinition> | Required<ITemplateDefinition>;
type Kind = { name: string };

function hasDescription(type: unknown): type is ({ description: Description; kind: Kind }) {
  return (type as { description: Description }).description != void 0;
}

interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: unknown, customElementType: unknown, parentContext: IServiceLocator): ITemplate;
}

type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & {
  render(flags: LifecycleFlags, host: T, parts: Record<string, TemplateDefinition>, parentContext: IServiceLocator): IElementTemplateProvider | void;
  created(flags: LifecycleFlags): void;

  binding(flags: LifecycleFlags): MaybePromiseOrTask;
  bound(flags: LifecycleFlags): void;

  unbinding(flags: LifecycleFlags): MaybePromiseOrTask;
  unbound(flags: LifecycleFlags): void;

  attaching(flags: LifecycleFlags): void;
  attached(flags: LifecycleFlags): void;

  detaching(flags: LifecycleFlags): void;
  detached(flags: LifecycleFlags): void;

  caching(flags: LifecycleFlags): void;
}>;

export class Controller<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>
> implements IController<T, C> {
  private static readonly lookup: WeakMap<object, Controller> = new WeakMap();

  public readonly id: number;

  public nextBound?: Controller<T, C>;
  public nextUnbound?: Controller<T, C>;
  public prevBound?: Controller<T, C>;
  public prevUnbound?: Controller<T, C>;

  public nextAttached?: Controller<T, C>;
  public nextDetached?: Controller<T, C>;
  public prevAttached?: Controller<T, C>;
  public prevDetached?: Controller<T, C>;

  public nextMount?: Controller<T, C>;
  public nextUnmount?: Controller<T, C>;
  public prevMount?: Controller<T, C>;
  public prevUnmount?: Controller<T, C>;

  public readonly flags: LifecycleFlags;
  public readonly viewCache?: IViewCache<T>;

  public parent?: IController<T>;
  public bindings?: IBinding[];
  public controllers?: Controller<T, C>[];

  public state: State;

  public readonly lifecycle: ILifecycle;

  public readonly hooks: HooksDefinition;
  public readonly viewModel?: C;
  public readonly bindingContext?: BindingContext<T, C>;

  public readonly host?: T;

  public readonly vmKind: ViewModelKind;

  public scopeParts?: string[];
  public isStrictBinding?: boolean;

  public scope?: IScope;
  public part?: string;
  public projector?: IElementProjector;

  public nodes?: INodeSequence<T>;
  public context?: IContainer | IRenderContext<T>;
  public location?: IRenderLocation<T>;

  // todo: refactor
  public constructor(
    flags: LifecycleFlags,
    viewCache: IViewCache<T> | undefined,
    lifecycle: ILifecycle | undefined,
    viewModel: C | undefined,
    parentContext: IContainer | IRenderContext<T> | undefined,
    host: T | undefined,
    options: Partial<IElementHydrationOptions>,
  ) {
    this.id = nextId('au$component');

    this.nextBound = void 0;
    this.nextUnbound = void 0;
    this.prevBound = void 0;
    this.prevUnbound = void 0;

    this.nextAttached = void 0;
    this.nextDetached = void 0;
    this.prevAttached = void 0;
    this.prevDetached = void 0;

    this.nextMount = void 0;
    this.nextUnmount = void 0;
    this.prevMount = void 0;
    this.prevUnmount = void 0;

    this.flags = flags;
    this.viewCache = viewCache;

    this.bindings = void 0;
    this.controllers = void 0;

    this.state = State.none;

    if (viewModel == void 0) {
      if (viewCache == void 0) {
        // TODO: create error code
        throw new Error(`No IViewCache was provided when rendering a synthetic view.`);
      }
      if (lifecycle == void 0) {
        // TODO: create error code
        throw new Error(`No ILifecycle was provided when rendering a synthetic view.`);
      }
      this.lifecycle = lifecycle;

      this.hooks = HooksDefinition.none;
      this.viewModel = void 0;
      this.bindingContext = void 0; // stays undefined

      this.host = void 0; // stays undefined

      this.vmKind = ViewModelKind.synthetic;

      this.scopeParts = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
      this.isStrictBinding = false; // will be populated during ITemplate.render() immediately after the constructor is done

      this.scope = void 0; // will be populated during bindSynthetic()
      this.projector = void 0; // stays undefined

      this.nodes = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
      this.context = void 0; // will be populated during ITemplate.render() immediately after the constructor is done
      this.location = void 0; // should be set with `hold(location)` by the consumer
    } else {
      if (parentContext == void 0) {
        // TODO: create error code
        throw new Error(`No parentContext was provided when rendering a custom element or attribute.`);
      }
      this.lifecycle = parentContext.get(ILifecycle);

      (viewModel as Writable<C>).$controller = this;

      const Type = viewModel.constructor;
      if (!hasDescription(Type)) {
        // TODO: create error code
        throw new Error(`The provided viewModel does not have a (valid) description.`);
      }
      const { description } = Type;
      flags |= description.strategy;
      createObservers(this, description, flags, viewModel);
      this.hooks = description.hooks;
      this.viewModel = viewModel;
      this.bindingContext = getBindingContext<T, C>(flags, viewModel);

      this.host = host;

      let instruction: IHydrateElementInstruction | IHydrateTemplateController;
      let parts: Record<string, TemplateDefinition>;
      let renderingEngine: IRenderingEngine;
      let template: ITemplate<INode>|undefined = void 0;
      switch (Type.kind.name) {
        case 'custom-element':
          if (host == void 0) {
            // TODO: create error code
            throw new Error(`No host element was provided when rendering a custom element.`);
          }

          this.vmKind = ViewModelKind.customElement;

          renderingEngine = parentContext.get(IRenderingEngine);

          if (this.hooks.hasRender) {
            const result = this.bindingContext.render(
              flags,
              host,
              options.parts == void 0
                ? PLATFORM.emptyObject
                : options.parts,
              parentContext,
            );

            if (result != void 0 && 'getElementTemplate' in result) {
              template = result.getElementTemplate(renderingEngine, Type, parentContext);
            }
          } else {
            template = renderingEngine.getElementTemplate(parentContext.get(IDOM), description as Required<ITemplateDefinition>, parentContext, Type as ICustomElementType);
          }

          if (template !== void 0) {
            if (
              template.definition == null ||
              template.definition.instructions.length === 0 ||
              template.definition.instructions[0].length === 0 ||
              (
                (template.definition.instructions[0][0] as IHydrateElementInstruction | IHydrateTemplateController).parts == void 0
              )
            ) {
              if (options.parts == void 0) {
                parts = PLATFORM.emptyObject;
              } else {
                parts = options.parts;
              }
            } else {
              instruction = template.definition.instructions[0][0] as IHydrateElementInstruction | IHydrateTemplateController;
              if (options.parts == void 0) {
                parts = instruction.parts as typeof parts;
              } else {
                parts = { ...options.parts, ...(instruction.parts as typeof parts) };
              }
            }
            template.render(this, host, parts);
          }

          this.scope = Scope.create(flags, this.bindingContext, null);

          this.projector = parentContext.get(IProjectorLocator).getElementProjector(
            parentContext.get(IDOM),
            this,
            host,
            description as Required<ITemplateDefinition>
          );

          this.location = void 0;
          break;
        case 'custom-attribute':
          this.vmKind = ViewModelKind.customAttribute;

          this.scope = void 0;
          this.projector = void 0;

          this.nodes = void 0;
          this.context = void 0;
          this.location = void 0;
          break;
        default:
          throw new Error(`Invalid resource kind: '${Type.kind.name}'`);
      }

      if (this.hooks.hasCreated) {
        this.bindingContext.created(flags);
      }
    }
  }

  public static forCustomElement<T extends INode = INode>(
    viewModel: object,
    parentContext: IContainer | IRenderContext<T>,
    host: T,
    flags: LifecycleFlags = LifecycleFlags.none,
    options: IElementHydrationOptions = PLATFORM.emptyObject,
  ): Controller<T> {
    let controller = Controller.lookup.get(viewModel) as Controller<T> | undefined;
    if (controller === void 0) {
      controller = new Controller<T>(
        flags,
        void 0,
        void 0,
        viewModel,
        parentContext,
        host,
        options,
      );
      this.lookup.set(viewModel, controller);
    }
    return controller;
  }

  public static forCustomAttribute<T extends INode = INode>(
    viewModel: object,
    parentContext: IContainer | IRenderContext<T>,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T> {
    let controller = Controller.lookup.get(viewModel) as Controller<T> | undefined;
    if (controller === void 0) {
      controller = new Controller<T>(
        flags | LifecycleFlags.isStrictBindingStrategy,
        void 0,
        void 0,
        viewModel,
        parentContext,
        void 0,
        PLATFORM.emptyObject,
      );
      this.lookup.set(viewModel, controller);
    }
    return controller;
  }

  public static forSyntheticView<T extends INode = INode>(
    viewCache: IViewCache<T>,
    lifecycle: ILifecycle,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T> {
    return new Controller<T>(
      flags,
      viewCache,
      lifecycle,
      void 0,
      void 0,
      void 0,
      PLATFORM.emptyObject,
    );
  }

  public lockScope(scope: IScope): void {
    this.scope = scope;
    this.state |= State.hasLockedScope;
  }

  public hold(location: IRenderLocation<T>): void {
    this.state = (this.state | State.canBeCached) ^ State.canBeCached;
    this.location = location;
  }

  public release(flags: LifecycleFlags): boolean {
    this.state |= State.canBeCached;
    if ((this.state & State.isAttached) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.viewCache!.canReturnToCache(this); // non-null is implied by the hook
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

  public bound(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.bound(flags); // non-null is implied by the hook
  }

  public unbound(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.unbound(flags); // non-null is implied by the hook
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

  public attached(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.attached(flags); // non-null is implied by the hook
  }

  public detached(flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.bindingContext!.detached(flags); // non-null is implied by the hook
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

    this.lifecycle.bound.begin();
    this.bindBindings(flags, $scope);

    if (this.hooks.hasBinding) {
      const ret = (this.bindingContext as BindingContext<T, C>).binding(flags);
      if (hasAsyncWork(ret)) {
        return new ContinuationTask(ret, this.bindControllers, this, flags, $scope);
      }
    }

    return this.bindControllers(flags, $scope);
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
    this.lifecycle.bound.begin();

    if (this.hooks.hasBinding) {
      const ret = (this.bindingContext as BindingContext<T, C>).binding(flags);
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

    this.lifecycle.bound.begin();
    this.bindBindings(flags, scope);

    return this.bindControllers(flags, scope);
  }

  private bindBindings(flags: LifecycleFlags, scope: IScope): void {
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
  }

  private bindControllers(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask | undefined;

    const { controllers } = this;
    if (controllers !== void 0) {
      const { length } = controllers;
      for (let i = 0; i < length; ++i) {
        controllers[i].parent = this;
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
    if (this.hooks.hasBound) {
      this.lifecycle.bound.add(this);
    }
    this.state = this.state ^ State.isBinding | State.isBound;
    this.lifecycle.bound.end(flags);
  }

  private unbindCustomElement(flags: LifecycleFlags): ILifecycleTask {
    if ((this.state & State.isBound) === 0) {
      return LifecycleTask.done;
    }

    (this.scope as Writable<IScope>).parentScope = null;

    this.state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.unbound.begin();

    if (this.hooks.hasUnbinding) {
      const ret = (this.bindingContext as BindingContext<T, C>).unbinding(flags);
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
    this.lifecycle.unbound.begin();

    if (this.hooks.hasUnbinding) {
      const ret = (this.bindingContext as BindingContext<T, C>).unbinding(flags);
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
    this.lifecycle.unbound.begin();

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
    if (this.hooks.hasUnbound) {
      this.lifecycle.unbound.add(this);
    }

    this.state = (this.state | State.isBoundOrUnbinding) ^ State.isBoundOrUnbinding;
    this.lifecycle.unbound.end(flags);
  }
  // #endregion

  // #region attach/detach
  private attachCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.mount.add(this);
    this.lifecycle.attached.begin();

    if (this.hooks.hasAttaching) {
      (this.bindingContext as BindingContext<T, C>).attaching(flags);
    }

    this.attachControllers(flags);

    if (this.hooks.hasAttached) {
      this.lifecycle.attached.add(this);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
    this.lifecycle.attached.end(flags);
  }

  private attachCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.attached.begin();

    if (this.hooks.hasAttaching) {
      (this.bindingContext as BindingContext<T, C>).attaching(flags);
    }

    if (this.hooks.hasAttached) {
      this.lifecycle.attached.add(this);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
    this.lifecycle.attached.end(flags);
  }

  private attachSynthetic(flags: LifecycleFlags): void {
    if (((this.state & State.isAttached) > 0 && flags & LifecycleFlags.reorderNodes) > 0) {
      this.lifecycle.mount.add(this);
    } else {
      flags |= LifecycleFlags.fromAttach;
      this.state |= State.isAttaching;

      this.lifecycle.mount.add(this);
      this.lifecycle.attached.begin();

      this.attachControllers(flags);

      this.state = this.state ^ State.isAttaching | State.isAttached;
      this.lifecycle.attached.end(flags);
    }
  }

  private detachCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.detached.begin();
    this.lifecycle.unmount.add(this);

    if (this.hooks.hasDetaching) {
      (this.bindingContext as BindingContext<T, C>).detaching(flags);
    }

    this.detachControllers(flags);

    if (this.hooks.hasDetached) {
      this.lifecycle.detached.add(this);
    }

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.detached.end(flags);
  }

  private detachCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.detached.begin();

    if (this.hooks.hasDetaching) {
      (this.bindingContext as BindingContext<T, C>).detaching(flags);
    }

    if (this.hooks.hasDetached) {
      this.lifecycle.detached.add(this);
    }

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.detached.end(flags);
  }

  private detachSynthetic(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.detached.begin();
    this.lifecycle.unmount.add(this);

    this.detachControllers(flags);

    this.state = (this.state | State.isAttachedOrDetaching) ^ State.isAttachedOrDetaching;
    this.lifecycle.detached.end(flags);
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
    this.state |= State.isMounted;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.nodes!.insertBefore(this.location!); // non-null is implied by the hook
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
      if (this.viewCache!.tryReturnToCache(this)) { // non-null is implied by the hook
        this.state |= State.isCached;
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

function createObservers(
  controller: IController,
  description: Description,
  flags: LifecycleFlags,
  instance: object,
): void {
  const hasLookup = (instance as IIndexable).$observers != void 0;
  const observers: Record<string, SelfObserver | ChildrenObserver> = hasLookup ? (instance as IIndexable).$observers as Record<string, SelfObserver> : {};
  const bindables = description.bindables as Record<string, Required<IBindableDescription>>;
  const observableNames = Object.getOwnPropertyNames(bindables);
  const useProxy = (flags & LifecycleFlags.proxyStrategy) > 0 ;
  const lifecycle = controller.lifecycle;
  const hasChildrenObservers = 'childrenObservers' in description;

  const length = observableNames.length;
  let name: string;
  for (let i = 0; i < length; ++i) {
    name = observableNames[i];

    if (observers[name] == void 0) {
      observers[name] = new SelfObserver(
        lifecycle,
        flags,
        useProxy ? ProxyObserver.getOrCreate(instance).proxy : instance,
        name,
        bindables[name].callback
      );
    }
  }

  if (hasChildrenObservers) {
    const childrenObservers = (description as any).childrenObservers as Record<string, Required<IChildrenObserverDescription>>;

    if (childrenObservers) {
      const childObserverNames = Object.getOwnPropertyNames(childrenObservers);
      const { length } = childObserverNames;

      let name: string;
      for (let i = 0; i < length; ++i) {
        name = childObserverNames[i];

        if (observers[name] == void 0) {
          const childrenDescription = childrenObservers[name];
          observers[name] = new ChildrenObserver(
            controller,
            instance,
            flags,
            name,
            childrenDescription.callback,
            childrenDescription.query,
            childrenDescription.filter,
            childrenDescription.map,
            childrenDescription.options
          );
        }
      }
    }
  }

  if (!useProxy || hasChildrenObservers) {
    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });
  }
}

function getBindingContext<T extends INode, C extends IViewModel<T>>(flags: LifecycleFlags, instance: object): BindingContext<T, C> {
  if ((instance as IIndexable).noProxy === true || (flags & LifecycleFlags.proxyStrategy) === 0) {
    return instance as BindingContext<T, C>;
  }

  return ProxyObserver.getOrCreate(instance).proxy as unknown as BindingContext<T, C>;
}
