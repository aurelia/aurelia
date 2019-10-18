import {
  IContainer,
  Key,
  nextId,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import {
  HooksDefinition,
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
  IController,
  IViewFactory,
  MountStrategy
} from '../../lifecycle';
import { InlineObserversLookup } from '../../observation';
import { Scope } from '../../observation/binding-context';
import { Bindable } from '../../templating/bindable';
import {
  CustomAttribute,
  ICustomAttributeResource
} from '../custom-attribute';

export class With<T extends INode = INode> {
  public static readonly inject: readonly Key[] = [IViewFactory, IRenderLocation];

  public static readonly kind: ICustomAttributeResource = CustomAttribute;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'with',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(With.prototype)),
  });

  public readonly id: number;

  public get value(): object | undefined {
    return this._value;
  }
  public set value(newValue: object | undefined) {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.valueChanged(newValue, oldValue, LifecycleFlags.none);
    }
  }

  public readonly $observers: InlineObserversLookup<this> = Object.freeze({
    value: this,
  });

  public readonly view: IController<T>;
  private readonly factory: IViewFactory<T>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller!: IController<T>; // This is set by the controller after this instance is constructed

  private _value: object | undefined;

  public constructor(
    factory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.id = nextId('au$component');

    this.factory = factory;
    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);

    this._value = void 0;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:with', this));
    container.register(Registration.transient(this, this));
  }

  public valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isBoundOrBinding) > 0) {
      this.bindChild(LifecycleFlags.fromBind);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.view.parent = this.$controller;
    this.bindChild(flags);
  }

  public attaching(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.view.unbind(flags);
    this.view.parent = void 0;
  }

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(flags, this.$controller.scope!, this.value === void 0 ? {} : this.value);
    this.view.bind(flags, scope, this.$controller.part);
  }
}
