import {
  IContainer,
  InjectArray,
  IServiceLocator,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import {
  IAttributeDefinition
} from '../../definitions';
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
import { IScope } from '../../observation';
import {
  CustomAttributeResource,
  ICustomAttribute,
  ICustomAttributeResource
} from '../custom-attribute';

export interface Replaceable<T extends INode = INode> extends ICustomAttribute<T> {}
export class Replaceable<T extends INode = INode> implements Replaceable<T> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = {
    name: 'replaceable',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: BindingStrategy.getterSetter,
  };

  public $lifecycle: ILifecycle;
  public $state: State;
  public $scope: IScope;

  private readonly currentView: IView<T>;
  private readonly factory: IViewFactory<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.$lifecycle = (void 0)!;
    this.$state = State.none;
    this.$scope = (void 0)!;

    this.factory = factory;

    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:replaceable', this));
  }

  public $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator): void { /* empty */ }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    flags |= LifecycleFlags.fromBind;
    if (isBound(this.$state)) {
      if (this.$scope === scope) return;
      this.$unbind(flags);
    }

    this.$scope = scope;

    this.$state = setBinding(this.$state);

    this.currentView.$bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$scope);

    this.$state = setBound(this.$state);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (isNotBound(this.$state)) return;

    this.$state = setUnbinding(this.$state);

    this.currentView.$unbind(flags);

    this.$state = setUnbound(this.$state);
  }

  public $attach(flags: LifecycleFlags): void {
    if (isAttached(this.$state)) return;

    this.$state = setAttaching(this.$state);

    this.currentView.$attach(flags);

    this.$state = setAttached(this.$state);
  }

  public $detach(flags: LifecycleFlags): void {
    if (isNotAttached(this.$state)) return;

    this.$state = setDetaching(this.$state);

    this.currentView.$detach(flags);

    this.$state = setDetached(this.$state);
  }
}
