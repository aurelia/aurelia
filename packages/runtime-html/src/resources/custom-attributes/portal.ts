import {
  IContainer,
  IIndexable,
  Key,
  nextId,
  PLATFORM,
  Registration,
} from '@aurelia/kernel';

import {
  Bindable,
  BindingMode,
  BindingStrategy,
  ContinuationTask,
  CustomAttributeResource,
  HooksDefinition,
  IAccessor,
  IAttributeDefinition,
  IController,
  ICustomAttributeResource,
  IDOM,
  ILifecycleTask,
  InlineObserversLookup,
  IRenderLocation,
  IViewFactory,
  LifecycleFlags,
  LifecycleTask,
  PropertyAccessor,
  State,
  TerminalTask,
} from '@aurelia/runtime';

import {
  HTMLDOM,
} from '../../dom';

export type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
type ResolvedTarget<T extends ParentNode = ParentNode> = T | null;

export type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: IController<T>) => void | Promise<void> | ILifecycleTask;

function toTask(maybePromiseOrTask: void | Promise<void> | ILifecycleTask): ILifecycleTask {
  if (maybePromiseOrTask == null) {
    return LifecycleTask.done;
  }

  if (typeof (maybePromiseOrTask as Promise<void>).then === 'function') {
    return new TerminalTask(maybePromiseOrTask);
  }

  return maybePromiseOrTask as ILifecycleTask;
}

export class Portal<T extends ParentNode = ParentNode> {
  public static readonly inject: readonly Key[] = [IViewFactory, IRenderLocation, IDOM];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'portal',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({
      bindables: [
        'target',
        'renderContext',
        'strict',
        'deactivating',
        'activating',
        'deactivated',
        'activated',
        'callbackContext',
      ],
    }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(Portal.prototype)),
  });

  public readonly id: number;

  public get target(): PortalTarget<T> {
    return this._target;
  }

  public set target(newValue: PortalTarget<T>) {
    const oldValue = this._target;
    if (oldValue !== newValue) {
      this._target = newValue;
      this.targetChanged(newValue, oldValue, this.$controller.flags);
    }
  }

  public get renderContext(): PortalTarget<T> {
    return this._renderContext;
  }

  public set renderContext(newValue: PortalTarget<T>) {
    const oldValue = this._renderContext;
    if (oldValue !== newValue) {
      this._renderContext = newValue;
      this.targetChanged(newValue, oldValue, this.$controller.flags);
    }
  }

  public strict: boolean;
  public deactivating?: PortalLifecycleCallback<T>;
  public activating?: PortalLifecycleCallback<T>;
  public deactivated?: PortalLifecycleCallback<T>;
  public activated?: PortalLifecycleCallback<T>;
  public callbackContext: unknown;

  public readonly view: IController<T>;
  private readonly factory: IViewFactory<T>;
  private readonly dom: HTMLDOM;
  private readonly originalLoc: IRenderLocation;

  private task: ILifecycleTask;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  private $controller!: IController<T>;

  private _target: PortalTarget<T>;
  private _renderContext: PortalTarget<T>;

  private readonly _targetObserver: IAccessor = (() => {
    const $this = this;
    return {
      getValue(): PortalTarget<T> {
        return $this._target;
      },
      setValue(newValue: PortalTarget<T>, flags: LifecycleFlags): void {
        const oldValue = $this._target;
        if (oldValue !== newValue) {
          $this._target = newValue;
          $this.targetChanged(newValue, oldValue, flags | $this.$controller.flags);
        }
      },
    };
  })();
  private readonly _renderContextObserver: IAccessor = (() => {
    const $this = this;
    return {
      getValue(): PortalTarget<T> {
        return $this._renderContext;
      },
      setValue(newValue: PortalTarget<T>, flags: LifecycleFlags): void {
        const oldValue = $this._renderContext;
        if (oldValue !== newValue) {
          $this._renderContext = newValue;
          $this.targetChanged(newValue, oldValue, flags | $this.$controller.flags);
        }
      },
    };
  })();

  // tslint:disable-next-line: member-ordering
  public readonly $observers: InlineObserversLookup<IAccessor> = Object.freeze({
    target: this._targetObserver,
    renderContext: this._renderContextObserver,
    // Use simple accessors for the bindables that don't need change handlers
    strict: new PropertyAccessor(this as IIndexable, 'strict'),
    deactivating: new PropertyAccessor(this as IIndexable, 'deactivating'),
    activating: new PropertyAccessor(this as IIndexable, 'activating'),
    deactivated: new PropertyAccessor(this as IIndexable, 'deactivated'),
    activated: new PropertyAccessor(this as IIndexable, 'activated'),
    callbackContext: new PropertyAccessor(this as IIndexable, 'callbackContext'),
  });

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>,
    dom: HTMLDOM,
  ) {
    this.id = nextId('au$component');

    this.factory = factory;
    this.originalLoc = location;
    this.dom = dom;

    this.task = LifecycleTask.done;
    this.view = this.factory.create();
    this.view.hold(location);

    this._target = void 0;
    this._renderContext = void 0;
    this.strict = false;
    this.deactivating = void 0;
    this.activating = void 0;
    this.deactivated = void 0;
    this.activated = void 0;
    this.callbackContext = void 0;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:portal', this));
    container.register(Registration.transient(this, this));
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope!.bindingContext;
    }

    return this.view.bind(flags, this.$controller.scope);
  }

  public attaching(flags: LifecycleFlags): void {
    const newTarget = this.target = this.resolveTarget();
    this.task = this.activate(newTarget, flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.task = this.deactivate(flags);
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.callbackContext = null;
    return this.view.unbind(flags);
  }

  public targetChanged(newValue: PortalTarget<T>, oldValue: PortalTarget<T>, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isBound) === 0) {
      return;
    }

    this.project(flags);
  }

  private project(flags: LifecycleFlags): void {
    const oldTarget = this.target;
    const newTarget = this.target = this.resolveTarget();

    if (oldTarget === newTarget) {
      return;
    }

    this.task = this.deactivate(flags);
    this.task = this.activate(newTarget, flags);
  }

  private activate(target: T, flags: LifecycleFlags): ILifecycleTask {
    const { activating, activated, callbackContext, view } = this;
    let task = this.task;

    view.hold(target);

    if ((this.$controller.state & State.isAttachedOrAttaching) === 0) {
      return task;
    }

    if (typeof activating === 'function') {
      if (task.done) {
        task = toTask(activating.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, activating, callbackContext, target, view);
      }
    }

    if (task.done) {
      view.attach(flags);
    } else {
      task = new ContinuationTask(task, view.attach, view, flags);
    }

    if (typeof activated === 'function') {
      if (task.done) {
        // TODO: chain this up with RAF queue mount callback so activated is called only when
        // node is actually mounted (is this needed as per the spec of this resource?)
        task = toTask(activated.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, activated, callbackContext, target, view);
      }
    }

    return task;
  }

  private deactivate(flags: LifecycleFlags): ILifecycleTask {
    const { deactivating, deactivated, callbackContext, view, target } = this;
    let task = this.task;

    if (typeof deactivating === 'function') {
      if (task.done) {
        task = toTask(deactivating.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, deactivating, callbackContext, target, view);
      }
    }

    if (task.done) {
      view.detach(flags);
    } else {
      task = new ContinuationTask(task, view.detach, view, flags);
    }

    if (typeof deactivated === 'function') {
      if (task.done) {
        task = toTask(deactivated.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, deactivated, callbackContext, target, view);
      }
    }

    return task;
  }

  private resolveTarget(): T {
    let target = this._target;
    let context = this._renderContext;

    if (typeof target === 'string') {
      let queryContext: ParentNode = this.dom.document;
      if (typeof context === 'string') {
        context = this.dom.document.querySelector(context) as ResolvedTarget<T>;
      }
      if (this.dom.isNodeInstance(context)) {
        queryContext = context;
      }
      target = queryContext.querySelector(target) as ResolvedTarget<T>;
    }

    if (this.dom.isNodeInstance(target)) {
      return target;
    }

    if (target == null) {
      if (this.strict) {
        throw new Error('Render target not found');
      } else {
        target = this.dom.document as unknown as ResolvedTarget<T>;
      }
    }

    return target!;
  }
}
