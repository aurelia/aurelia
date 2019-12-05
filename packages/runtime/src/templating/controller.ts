import {
  IContainer,
  IIndexable,
  IServiceLocator,
  mergeDistinct,
  nextId,
  Writable,
  Constructable,
  Registration,
} from '@aurelia/kernel';
import {
  PropertyBinding,
} from '../binding/property-binding';
import {
  HooksDefinition,
  PartialCustomElementDefinitionParts
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
  IViewModel,
  ViewModelKind,
  MountStrategy,
  IViewFactory,
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
  ChildrenObserver,
  ITemplate,
  IRenderer,
  ITemplateCompiler,
  ViewCompileFlags,
} from '../rendering-engine';
import {
  IElementProjector,
  IProjectorLocator,
  CustomElementDefinition,
  CustomElement,
} from '../resources/custom-element';
import { CustomAttributeDefinition, CustomAttribute } from '../resources/custom-attribute';
import { BindableDefinition } from './bindable';
import { RenderContext } from '../render-context';

type Definition = CustomAttributeDefinition | CustomElementDefinition;

interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: unknown, customElementType: unknown, parentContext: IServiceLocator): ITemplate;
}

const fragmentLookup = new WeakMap<CustomElementDefinition, INode | null>();
// Just a wrapper around dom.createDocumentFragment with a weakmap cache in-between
function getFragment(dom: IDOM, definition: CustomElementDefinition): INode | null {
  let node = fragmentLookup.get(definition);
  if (node === void 0) {
    const template = definition.template;
    if (template === null || template === void 0) {
      fragmentLookup.set(definition, node = null);
    } else {
      fragmentLookup.set(definition, node = dom.createDocumentFragment(template as string | INode));
    }
  }
  return node;
}

type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & {
  render(flags: LifecycleFlags, host: T, parts: PartialCustomElementDefinitionParts, parentContext: IServiceLocator): IElementTemplateProvider | void;
  created(flags: LifecycleFlags): void;

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

const definitionMapLookup = new WeakMap<CustomElementDefinition, WeakMap<RenderContext, CustomElementDefinition>>();
function getDefinitionMap(definition: CustomElementDefinition): WeakMap<RenderContext, CustomElementDefinition> {
  if (definitionMapLookup.has(definition)) {
    return definitionMapLookup.get(definition)!;
  }

  const definitionMap = new WeakMap();
  definitionMapLookup.set(definition, definitionMap);
  return definitionMap;
}

const controllerLookup: WeakMap<object, Controller> = new WeakMap();
export class Controller<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>
> implements IController<T, C> {
  public readonly id: number = nextId('au$component');

  public nextBound: Controller<T, C> | undefined = void 0;
  public nextUnbound: Controller<T, C> | undefined = void 0;
  public prevBound: Controller<T, C> | undefined = void 0;
  public prevUnbound: Controller<T, C> | undefined = void 0;

  public nextAttached: Controller<T, C> | undefined = void 0;
  public nextDetached: Controller<T, C> | undefined = void 0;
  public prevAttached: Controller<T, C> | undefined = void 0;
  public prevDetached: Controller<T, C> | undefined = void 0;

  public nextMount: Controller<T, C> | undefined = void 0;
  public nextUnmount: Controller<T, C> | undefined = void 0;
  public prevMount: Controller<T, C> | undefined = void 0;
  public prevUnmount: Controller<T, C> | undefined = void 0;

  public parent: IController<T> | undefined = void 0;
  public bindings: IBinding[] | undefined = void 0;
  public controllers: Controller<T, C>[] | undefined = void 0;

  public state: State = State.none;

  public scopeParts: string[] | undefined = void 0;
  public isStrictBinding: boolean = false;

  public scope: IScope | undefined = void 0;
  public part: string | undefined = void 0;
  public projector: IElementProjector | undefined = void 0;

  public nodes: INodeSequence<T> | undefined = void 0;
  public context: IContainer | IRenderContext<T> | undefined = void 0;
  public location: IRenderLocation<T> | undefined = void 0;
  public mountStrategy: MountStrategy = MountStrategy.insertBefore;

  private isHydrated: boolean = false;

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

  public static forCustomElement<
    T extends INode = INode,
    C extends IViewModel<T> = IViewModel<T>,
  >(
    viewModel: C,
    lifecycle: ILifecycle,
    host: T,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T, C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as Controller<T, C>;
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

    controllerLookup.set(viewModel, controller);
    return controller;
  }

  public static forCustomAttribute<
    T extends INode = INode,
    C extends IViewModel<T> = IViewModel<T>,
  >(
    viewModel: C,
    lifecycle: ILifecycle,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T, C> {
    if (controllerLookup.has(viewModel)) {
      return controllerLookup.get(viewModel) as Controller<T, C>;
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
      /* host           */void 0,
    );

    controllerLookup.set(viewModel, controller);
    return controller;
  }

  public static forSyntheticView<
    T extends INode = INode,
    C extends IViewModel<T> = IViewModel<T>,
  >(
    viewFactory: IViewFactory<T>,
    lifecycle: ILifecycle,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): Controller<T, C> {
    return new Controller<T, C>(
      /* vmKind         */ViewModelKind.synthetic,
      /* flags          */flags,
      /* lifecycle      */lifecycle,
      /* hooks          */HooksDefinition.none,
      /* viewFactory    */viewFactory,
      /* viewModel      */void 0,
      /* bindingContext */void 0,
      /* host           */void 0,
    );
  }

  public hydrate(
    definition: Definition,
    parentContext: IContainer | IRenderContext,
    parts?: PartialCustomElementDefinitionParts,
  ): this {
    if (this.isHydrated) {
      return this;
    }

    this.isHydrated = true;

    const vmKind = this.vmKind;
    if (vmKind === ViewModelKind.customAttribute || vmKind === ViewModelKind.customElement) {
      createObservers(this, definition, this.flags | definition.strategy, this.viewModel!);
    }

    if (vmKind === ViewModelKind.synthetic || vmKind === ViewModelKind.customElement) {
      let $definition = definition as CustomElementDefinition;
      const dom = parentContext.get(IDOM);

      const renderContext = RenderContext.getOrCreate(
        /* dom               */dom,
        /* partialDefinition */$definition,
        /* parentContext     */parentContext,
      );

      if (vmKind === ViewModelKind.customElement) {
        // Support Recursive Components by adding self to own view template container.
        $definition.register(renderContext);
        if ($definition.injectable !== null) {
          // If the element is registered as injectable, support injecting the instance into children
          // Note: this provider is never disposed at the moment. Perhaps we need to at some point, but not disposing it here doesn't necessarily need to cause memory leaks. Keep an eye on it though.
          Registration.instance($definition.injectable, this.viewModel!).register(renderContext);
        }
      }

      if ($definition.needsCompile) {
        const definitionMap = getDefinitionMap($definition);
        if (definitionMap.has(renderContext)) {
          $definition = definitionMap.get(renderContext)!;
        } else {
          const compiler = parentContext.get(ITemplateCompiler);
          $definition = compiler.compile(
            dom,
            $definition,
            renderContext.createRuntimeCompilationResources(),
            ViewCompileFlags.surrogate,
          );
          definitionMap.set(renderContext, $definition);
        }
      }

      const fragment = getFragment(dom, $definition)!;
      const nodes = dom.createNodeSequence(fragment);

      this.nodes = nodes as INodeSequence<T>;
      this.context = renderContext;
      this.scopeParts = $definition.scopeParts;
      this.isStrictBinding = $definition.isStrictBinding;
      this.flags |= $definition.strategy;

      const targets = nodes.findTargets();
      const renderer = parentContext.get(IRenderer);

      renderer.render(
        /* flags      */this.flags,
        /* dom        */dom,
        /* context    */renderContext,
        /* renderable */this,
        /* targets    */targets,
        /* definition */$definition,
        /* host       */this.host,
        /* parts      */parts,
      );

      if (vmKind === ViewModelKind.customElement) {
        this.scope = Scope.create(this.flags, this.bindingContext!, null);
        const projectorLocator = parentContext.get(IProjectorLocator);

        this.projector = projectorLocator.getElementProjector(
          parentContext.get(IDOM),
          this,
          this.host!,
          $definition,
        );

        (this.viewModel as Writable<C>).$controller = this;
      }
    }

    return this;
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
      return this.viewFactory!.canReturnToCache(this); // non-null is implied by the hook
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
    this.bindBindings(flags, $scope);

    if (this.hooks.hasBeforeBind) {
      const ret = (this.bindingContext as BindingContext<T, C>).beforeBind(flags);
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
      if (this.viewFactory!.tryReturnToCache(this)) { // non-null is implied by the hook
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
  description: Definition,
  flags: LifecycleFlags,
  instance: object,
): void {
  const hasLookup = (instance as IIndexable).$observers != void 0;
  const observers: Record<string, BindableObserver | ChildrenObserver> = hasLookup ? (instance as IIndexable).$observers as Record<string, BindableObserver> : {};
  const bindables = description.bindables;
  const observableNames = Object.getOwnPropertyNames(bindables);
  const useProxy = (flags & LifecycleFlags.proxyStrategy) > 0 ;
  const lifecycle = controller.lifecycle;
  const hasChildrenObservers = 'childrenObservers' in description;

  const length = observableNames.length;
  let name: string;
  let bindable: BindableDefinition;

  for (let i = 0; i < length; ++i) {
    name = observableNames[i];

    if (observers[name] == void 0) {
      bindable = bindables[name];

      observers[name] = new BindableObserver(
        lifecycle,
        flags,
        useProxy ? ProxyObserver.getOrCreate(instance).proxy : instance as IIndexable,
        name,
        bindable.callback,
        bindable.set,
      );
    }
  }

  if (hasChildrenObservers) {
    const childrenObservers = (description as CustomElementDefinition).childrenObservers;

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
            instance as IIndexable,
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
