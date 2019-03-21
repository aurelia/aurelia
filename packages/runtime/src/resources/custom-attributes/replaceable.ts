import {
  IContainer,
  InjectArray,
  PLATFORM,
  Registration,
} from '@aurelia/kernel';
import {
  HooksDefinition,
  IAttributeDefinition,
} from '../../definitions';
import {
  INode,
  IRenderLocation,
} from '../../dom';
import {
  BindingMode,
  BindingStrategy,
  LifecycleFlags,
} from '../../flags';
import {
  IController,
  ILifecycleTask,
  IViewFactory,
  LifecycleTask,
} from '../../lifecycle';
import {
  CustomAttributeResource,
  ICustomAttributeResource,
} from '../custom-attribute';

export class Replaceable<T extends INode = INode> {
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
    hooks: new HooksDefinition(Replaceable.prototype)
  };

  private readonly currentView: IController<T>;
  private readonly factory: IViewFactory<T>;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  private $controller!: IController<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.factory = factory;

    this.currentView = this.factory.create();
    this.currentView.hold(location);
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:replaceable', this));
    container.register(Registration.transient(this, this));
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    return this.currentView.bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$controller.scope);
  }

  public attaching(flags: LifecycleFlags): void {
    this.currentView.attach(flags);
  }

  public detaching(flags: LifecycleFlags): ILifecycleTask {
    this.currentView.detach(flags);
    return LifecycleTask.done;
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    return this.currentView.unbind(flags);
  }
}
