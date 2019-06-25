import {
  IContainer,
  Key,
  nextId,
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
  IViewFactory,
} from '../../lifecycle';
import {
  ILifecycleTask,
} from '../../lifecycle-task';
import {
  BindingContext,
} from '../../observation/binding-context';
import {
  CustomAttributeResource,
  ICustomAttributeResource,
} from '../custom-attribute';

export class Replaceable<T extends INode = INode> {
  public static readonly inject: readonly Key[] = [IViewFactory, IRenderLocation];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'replaceable',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(Replaceable.prototype)),
  });

  public readonly id: number;

  public readonly view: IController<T>;
  private readonly factory: IViewFactory<T>;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  private $controller!: IController<T>;

  constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.id = nextId('au$component');

    this.factory = factory;

    this.view = this.factory.create();
    this.view.hold(location);
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:replaceable', this));
    container.register(Registration.transient(this, this));
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    const prevName = BindingContext.partName;
    BindingContext.partName = this.factory.name;
    this.view.parent = this.$controller;
    const task = this.view.bind(flags | LifecycleFlags.allowParentScopeTraversal, this.$controller.scope);
    if (task.done) {
      BindingContext.partName = prevName;
    } else {
      task.wait().then(() => {
        BindingContext.partName = prevName;
      });
    }
    return task;
  }

  public attaching(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    const task = this.view.unbind(flags);
    this.view.parent = void 0;
    return task;
  }
}
