import {
  IIndexable,
  IServiceLocator,
  PLATFORM,
  Writable
} from '@aurelia/kernel';

import {
  HooksDefinition,
  IAttributeDefinition,
  IBindableDescription,
  IElementHydrationOptions,
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
  Lifecycle,
  Priority,
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
import { IBindingTargetAccessor, IScope, ObserversLookup } from '../observation';
import { Scope } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { SelfObserver } from '../observation/self-observer';
import { IRenderingEngine } from '../rendering-engine';
import {
  ICustomElementType,
  IElementProjector,
  IProjectorLocator
} from '../resources/custom-element';
import { Binding } from '../binding/binding';

type Description = Required<IAttributeDefinition> | Required<ITemplateDefinition>;
type Kind = { name: string };

function hasDescription(type: unknown): type is ({ description: Description; kind: Kind }) {
  return (type as { description: Description }).description != void 0;
}

interface ITemplate<T extends INode = INode> {
  readonly renderContext: IRenderContext<T>;
  readonly dom: IDOM<T>;
  render(renderable: IController<T>, host?: T, parts?: Record<string, ITemplateDefinition>, flags?: LifecycleFlags): void;
}

interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: unknown, customElementType: unknown, parentContext: IServiceLocator): ITemplate;
}

type BindingContext<T extends INode, C extends IViewModel<T>> = C & IIndexable & {
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
}

export class Controller<T extends INode = INode, C extends IViewModel<T> = IViewModel<T>> implements IController<T, C> {
  private static readonly lookup: WeakMap<object, Controller> = new WeakMap();

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

  public bindings?: IBinding[];
  public controllers?: Controller<T, C>[];

  public state: State;

  public readonly lifecycle: ILifecycle;

  public readonly hooks: HooksDefinition;
  public readonly viewModel?: C;
  public readonly bindingContext?: BindingContext<T, C>;

  public readonly host?: T;

  public readonly vmKind: ViewModelKind;

  public scope?: IScope;
  public projector?: IElementProjector;

  public nodes?: INodeSequence<T>;
  public context?: IRenderContext<T>;
  public location?: IRenderLocation<T>;

  private constructor(
    flags: LifecycleFlags,
    viewCache: IViewCache<T> | undefined,
    lifecycle: ILifecycle | undefined,
    viewModel: C | undefined,
    parentContext: IRenderContext<T> | undefined,
    host: T | undefined,
    options: Partial<IElementHydrationOptions>
  ) {
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
      createObservers(this.lifecycle, description, flags, viewModel);
      this.hooks = description.hooks;
      this.viewModel = viewModel;
      this.bindingContext = getBindingContext<T, C>(flags, viewModel);

      this.host = host;

      switch (Type.kind.name) {
        case 'custom-element':
          if (host == void 0) {
            // TODO: create error code
            throw new Error(`No host element was provided when rendering a custom element.`);
          }

          this.vmKind = ViewModelKind.customElement;

          const renderingEngine = parentContext.get(IRenderingEngine);
          const parts = options.parts == void 0 ? PLATFORM.emptyObject : options.parts;

          if (this.hooks.hasRender) {
            const result = this.bindingContext.render(flags, host, parts, parentContext);

            if (result != void 0 && 'getElementTemplate' in result) {
              const template = result.getElementTemplate(renderingEngine, Type, parentContext);
              template.render(this, host, parts);
            }
          } else {
            const dom = parentContext.get(IDOM);
            const template = renderingEngine.getElementTemplate(dom, description, parentContext, Type as ICustomElementType);
            template.render(this, host, parts);
          }

          this.scope = Scope.create(flags, this.bindingContext, null);
          this.projector = parentContext.get(IProjectorLocator).getElementProjector(
            parentContext.get(IDOM),
            this,
            host,
            description
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
    parentContext: IRenderContext<T>,
    host: T,
    flags: LifecycleFlags = LifecycleFlags.none,
    options: IElementHydrationOptions = PLATFORM.emptyObject,
  ): Controller<T> {
    let controller = Controller.lookup.get(viewModel) as Controller<T> | undefined;
    if (controller === void 0) {
      controller = new Controller(flags, void 0, void 0, viewModel, parentContext, host, options);
      this.lookup.set(viewModel, controller);
    }
    return controller;
  }

  public static forCustomAttribute<T extends INode = INode>(
    viewModel: object,
    parentContext: IRenderContext<T>,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T> {
    let controller = Controller.lookup.get(viewModel) as Controller<T> | undefined;
    if (controller === void 0) {
      controller = new Controller(flags, void 0, void 0, viewModel, parentContext, void 0, PLATFORM.emptyObject);
      this.lookup.set(viewModel, controller);
    }
    return controller;
  }

  public static forSyntheticView<T extends INode = INode>(
    viewCache: IViewCache<T>,
    lifecycle: ILifecycle,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T> {
    return new Controller(flags, viewCache, lifecycle, void 0, void 0, void 0, PLATFORM.emptyObject);
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
      // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
      return this.viewCache!.canReturnToCache(this);
    }

    return this.unmountSynthetic(flags);
  }

  public bind(flags: LifecycleFlags, scope?: IScope): ILifecycleTask {
    // TODO: benchmark which of these techniques is fastest:
    // - the current one (enum with switch)
    // - set the name of the method in the constructor, e.g. this.bindMethod = 'bindCustomElement'
    //    and then doing this[this.bindMethod](flags, scope) instead of switch (eliminates branching
    //    but computed property access might be harmful to browser optimizations)
    // - make bind() a property and set it to one of the 3 methods in the constructor,
    //    e.g. this.bind = this.bindCustomElement (eliminates branching + reduces call stack depth by 1,
    //    but might make the call site megamorphic)
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
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.bindingContext!.bound(flags);
  }

  public unbound(flags: LifecycleFlags): void {
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.bindingContext!.unbound(flags);
  }

  public attach(flags: LifecycleFlags): void {
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
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.bindingContext!.attached(flags);
  }

  public detached(flags: LifecycleFlags): void {
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.bindingContext!.detached(flags);
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
      const binding = bindings.find(b => (b as Binding).targetProperty === propertyName) as Binding;
      if (binding !== void 0) {
        return binding.targetObserver;
      }
    }
    return void 0;
  }

  // #region bind/unbind
  private bindCustomElement(flags: LifecycleFlags, scope?: IScope): ILifecycleTask {
    if ((this.state & State.isBound) > 0) {
      return LifecycleTask.done;
    }

    flags |= LifecycleFlags.fromBind;
    const $scope = this.scope as Writable<IScope>;
    $scope.parentScope = scope;
    this.lifecycle.beginBind(this);
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

    this.scope = scope;
    this.lifecycle.beginBind(this);

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

    this.lifecycle.beginBind(this);
    this.bindBindings(flags, scope);

    return this.bindControllers(flags, scope);
  }

  private bindBindings(flags: LifecycleFlags, scope: IScope): void {
    const { bindings } = this;
    if (bindings !== void 0) {
      const { length } = bindings;
      for (let i = 0; i < length; ++i) {
        bindings[i].$bind(flags, scope);
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
        task = controllers[i].bind(flags, scope);
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
      this.lifecycle.enqueueBound(this);
    }
    this.lifecycle.endBind(flags, this);
  }

  private unbindCustomElement(flags: LifecycleFlags): ILifecycleTask {
    if ((this.state & State.isBound) === 0) {
      return LifecycleTask.done;
    }

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.beginUnbind(this);

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

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.beginUnbind(this);

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

    flags |= LifecycleFlags.fromUnbind;
    this.lifecycle.beginUnbind(this);

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
        if (!task.done) {
          if (tasks === void 0) {
            tasks = [];
          }
          tasks.push(task);
        }
      }
    }

    if (tasks === void 0) {
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
      this.lifecycle.enqueueBound(this);
    }
    this.lifecycle.endBind(flags, this);
  }
  // #endregion

  // #region attach/detach
  private attachCustomElement(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) > 0) {
      return;
    }

    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.enqueueRAF(this.mount, this, Priority.attach, true);

    if (this.hooks.hasAttaching) {
      (this.bindingContext as BindingContext<T, C>).attaching(flags);
    }

    this.attachControllers(flags);

    if (this.hooks.hasAttached) {
      this.lifecycle.enqueueRAF(this.attached, this, Priority.attach, true);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
  }

  private attachCustomAttribute(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) > 0) {
      return;
    }

    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    if (this.hooks.hasAttaching) {
      (this.bindingContext as BindingContext<T, C>).attaching(flags);
    }

    if (this.hooks.hasAttached) {
      this.lifecycle.enqueueRAF(this.attached, this, Priority.attach, true);
    }

    this.state = this.state ^ State.isAttaching | State.isAttached;
  }

  private attachSynthetic(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) > 0) {
      return;
    }

    flags |= LifecycleFlags.fromAttach;
    this.state |= State.isAttaching;

    this.lifecycle.enqueueRAF(this.mount, this, Priority.attach, true);

    this.attachControllers(flags);

    this.state = this.state ^ State.isAttaching | State.isAttached;
  }

  private detachCustomElement(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) === 0) {
      return;
    }

    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.enqueueRAF(this.unmount, this, Priority.attach, true);

    if (this.hooks.hasDetaching) {
      (this.bindingContext as BindingContext<T, C>).detaching(flags);
    }

    if (this.hooks.hasDetached) {
      this.lifecycle.enqueueRAF(this.detached, this, Priority.attach, true);
    }

    this.state = this.state ^ (State.isDetaching | State.isAttached);
  }

  private detachCustomAttribute(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) === 0) {
      return;
    }

    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    if (this.hooks.hasDetaching) {
      (this.bindingContext as BindingContext<T, C>).detaching(flags);
    }

    if (this.hooks.hasDetached) {
      this.lifecycle.enqueueRAF(this.detached, this, Priority.attach, true);
    }

    this.state = this.state ^ (State.isDetaching | State.isAttached);
  }

  private detachSynthetic(flags: LifecycleFlags): void {
    if ((this.state & State.isAttached) === 0) {
      return;
    }

    flags |= LifecycleFlags.fromDetach;
    this.state |= State.isDetaching;

    this.lifecycle.enqueueRAF(this.unmount, this, Priority.attach, true);

    this.detachControllers(flags);

    this.state = this.state ^ (State.isDetaching | State.isAttached);
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
        controllers[i].attach(flags);
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
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.projector!.project(this.nodes!);
  }

  private mountSynthetic(flags: LifecycleFlags): void {
    if ((this.state & State.isMounted) > 0) {
      return;
    }

    this.state |= State.isMounted;
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.nodes!.insertBefore(this.location!);
  }

  private unmountCustomElement(flags: LifecycleFlags): void {
    if ((this.state & State.isMounted) === 0) {
      return;
    }

    this.state ^= State.isMounted;
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.projector!.take(this.nodes!);
  }

  private unmountSynthetic(flags: LifecycleFlags): boolean {
    if ((this.state & State.isMounted) === 0) {
      return false;
    }

    this.state ^= State.isMounted;
    // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
    this.nodes!.remove();

    if ((this.state & State.canBeCached) > 0) {
      this.state ^= State.canBeCached;
      // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
      if (this.viewCache!.tryReturnToCache(this)) {
        this.state |= State.isCached;
        return true;
      }
    }
    return false;
  }

  private cacheCustomElement(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromCache;
    if (this.hooks.hasCaching) {
      // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
      this.bindingContext!.caching(flags);
    }
  }

  private cacheCustomAttribute(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromCache;
    if (this.hooks.hasCaching) {
      // tslint:disable-next-line: no-non-null-assertion // non-null is implied by the hook
      this.bindingContext!.caching(flags);
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

const marker = Controller.forSyntheticView(
  PLATFORM.emptyObject as IViewCache,
  PLATFORM.emptyObject as ILifecycle,
);

Lifecycle.marker = marker;

function createObservers(
  lifecycle: ILifecycle,
  description: Description,
  flags: LifecycleFlags,
  instance: IIndexable,
): void {
  const hasLookup = instance.$observers != void 0;
  const observers: Record<string, SelfObserver> = hasLookup ? instance.$observers as Record<string, SelfObserver> : {};
  const bindables = description.bindables as Record<string, Required<IBindableDescription>>;
  const observableNames = Object.getOwnPropertyNames(bindables);
  const useProxy = (flags & LifecycleFlags.proxyStrategy) > 0 ;

  const { length } = observableNames;
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

  if (!useProxy) {
    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });
  }
}

function getBindingContext<T extends INode, C extends IViewModel<T>>(flags: LifecycleFlags, instance: IIndexable): BindingContext<T, C> {
  if (instance.noProxy === true || (flags & LifecycleFlags.proxyStrategy) === 0) {
    return instance as BindingContext<T, C>;
  }

  return ProxyObserver.getOrCreate(instance).proxy as BindingContext<T, C>;
}
