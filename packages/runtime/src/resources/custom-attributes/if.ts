import {
  IContainer,
  InjectArray,
  IServiceLocator,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import { IAttributeDefinition } from '../../definitions';
import {
  INode,
  IRenderLocation
} from '../../dom';
import {
  BindingMode,
  BindingStrategy,
  LifecycleFlags,
  State
} from '../../flags';
import {
  CompositionCoordinator,
  ILifecycle,
  isAttached,
  isBound,
  isNotAttached,
  isNotBound,
  IView,
  IViewFactory,
  setAttached,
  setAttaching,
  setBinding,
  setBound,
  setDetached,
  setDetaching,
  setUnbinding,
  setUnbound
} from '../../lifecycle';
import {
  IObserversLookup,
  IScope
} from '../../observation';
import { ProxyObserver } from '../../observation/proxy-observer';
import { SetterObserver } from '../../observation/setter-observer';
import { Bindable } from '../../templating/bindable';
import {
  CustomAttributeResource,
  ICustomAttribute,
  ICustomAttributeResource
} from '../custom-attribute';

export interface If<T extends INode = INode> extends ICustomAttribute<T> {}
export class If<T extends INode = INode> implements If<T> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation, CompositionCoordinator];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = {
    name: 'if',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: Bindable.for({ bindables: ['value'] }).get(),
    strategy: BindingStrategy.getterSetter,
  };

  public get value(): boolean {
    return this._value;
  }
  public set value(newValue: boolean) {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.valueChanged(newValue, oldValue, LifecycleFlags.none);
    }
  }

  public readonly $observers: IObserversLookup = {
    value: this as this & SetterObserver,
  };

  public $lifecycle: ILifecycle;
  public $state: State;
  public $scope: IScope;

  public elseFactory?: IViewFactory<T>;
  public elseView?: IView<T>;
  public ifFactory?: IViewFactory<T>;
  public ifView?: IView<T>;
  public location: IRenderLocation<T>;
  public coordinator: CompositionCoordinator;

  private persistentFlags: LifecycleFlags;
  private _value: boolean;

  constructor(
    ifFactory: IViewFactory<T>,
    location: IRenderLocation<T>,
    coordinator: CompositionCoordinator
  ) {
    this.$lifecycle = (void 0)!;
    this.$state = State.none;
    this.$scope = (void 0)!;

    this.elseFactory = void 0;
    this.elseView = void 0;
    this.ifFactory = ifFactory;
    this.ifView = void 0;
    this.location = location;
    this.coordinator = coordinator;

    this.persistentFlags = LifecycleFlags.none;
    this._value = false;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:if', this));
  }

  public getValue(): boolean {
    return this._value;
  }

  public setValue(newValue: boolean, flags: LifecycleFlags): void {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.valueChanged(newValue, oldValue, flags);
    }
  }

  public $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator): void {
    this.$lifecycle = parentContext.get(ILifecycle);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    flags |= LifecycleFlags.fromBind;
    if (isBound(this.$state)) {
      if (this.$scope === scope) return;
      this.coordinator.unbinding(flags);
    }

    this.$scope = scope;

    this.$state = setBinding(this.$state);

    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    const view = this.updateView(flags);
    this.coordinator.compose(view, flags);
    this.coordinator.binding(flags, this.$scope);

    this.$state = setBound(this.$state);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (isNotBound(this.$state)) return;

    this.$state = setUnbinding(this.$state);

    this.coordinator.unbinding(flags | LifecycleFlags.fromUnbind);

    this.$state = setUnbound(this.$state);
  }

  public $attach(flags: LifecycleFlags): void {
    if (isAttached(this.$state)) return;

    this.$state = setAttaching(this.$state);

    this.coordinator.attaching(flags | LifecycleFlags.fromAttach);

    this.$state = setAttached(this.$state);
  }

  public $detach(flags: LifecycleFlags): void {
    if (isNotAttached(this.$state)) return;

    this.$state = setDetaching(this.$state);

    this.coordinator.detaching(flags | LifecycleFlags.fromDetach);

    this.$state = setDetached(this.$state);
  }

  public $cache(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromCache;
    if (this.ifView != null && this.ifView.release(flags)) {
      this.ifView = void 0;
    }
    if (this.elseView != null && this.elseView.release(flags)) {
      this.elseView = void 0;
    }
    this.coordinator.caching(flags);
  }

  public valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void {
    if ((this.$state & (State.isBound | State.isBinding)) > 0) {
      flags |= this.persistentFlags;
      const $this = ProxyObserver.getRawIfProxy(this);
      if (flags & LifecycleFlags.fromFlush) {
        const view = $this.updateView(flags);
        $this.coordinator.compose(view, flags);
      } else {
        $this.$lifecycle.enqueueFlush($this).catch(error => { throw error; });
      }
    }
  }

  public flush(flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    const view = $this.updateView(flags);
    $this.coordinator.compose(view, flags);
  }

  /** @internal */
  public updateView(flags: LifecycleFlags): IView<T> | null {
    let view: IView<T> | null;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, (this.ifFactory as IViewFactory<T>), flags);
    } else if (this.elseFactory != null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = null;
    }

    return view;
  }

  /** @internal */
  public ensureView(view: IView<T> | undefined, factory: IViewFactory<T>, flags: LifecycleFlags): IView<T> {
    if (view == null) {
      view = factory.create(flags);
    }

    view.hold(this.location);

    return view;
  }
}

export interface Else<T extends INode = INode> extends ICustomAttribute<T> {}
export class Else<T extends INode = INode> implements Else<T> {
  public static readonly inject: InjectArray = [IViewFactory];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = {
    name: 'else',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: BindingStrategy.getterSetter,
  };

  private readonly factory: IViewFactory<T>;

  constructor(factory: IViewFactory<T>) {
    this.factory = factory;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:else', this));
  }

  public $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator): void { /* empty */ }
  public $bind(flags: LifecycleFlags, scope: IScope): void { /* empty */ }
  public $unbind(flags: LifecycleFlags): void { /* empty */ }
  public $attach(flags: LifecycleFlags): void { /* empty */ }
  public $detach(flags: LifecycleFlags): void { /* empty */ }
  public $cache(flags: LifecycleFlags): void { /* empty */ }

  public link(ifBehavior: If<T>): void {
    ifBehavior.elseFactory = this.factory;
  }
}
