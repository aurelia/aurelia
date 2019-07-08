import {
  IContainer,
  Key,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import {
  Bindable,
  BindingMode,
  BindingStrategy,
  CustomAttribute,
  HooksDefinition,
  IAttributeDefinition,
  ICustomAttributeResource,
  IRenderLocation,
  LifecycleFlags
} from '@aurelia/runtime';

/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
export class TCustomAttribute {
  // public get value(): string {
  //     return this._value;
  // }
  // public set value(newValue: string) {
  //     const oldValue = this._value;
  //     if (oldValue !== newValue) {
  //         this._value = newValue;
  //         this.valueChanged(newValue, oldValue, this.$controller.flags);
  //     }
  // }
  public static readonly inject: readonly Key[] = [IRenderLocation];
  public static readonly kind: ICustomAttributeResource = CustomAttribute;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 't',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.fromView,
    hasDynamicOptions: false,
    isTemplateController: false,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(TCustomAttribute.prototype)),
  });

  private value: string;

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:t', this));
    container.register(Registration.transient(this, this));
  }

  public valueChanged(newValue: string, oldValue: string) {
    console.log(`custom-attribute:t: value changed from ${oldValue} to ${newValue}`);
  }

  public binding(flags: LifecycleFlags) {
    console.log(`custom-attribute:t binding ${this.value} ${flags}`);
  }

  public attaching(flags: LifecycleFlags) {
    console.log(`custom-attribute:t attaching ${this.value} ${flags}`);
  }

  public detaching(flags: LifecycleFlags) {
    console.log(`custom-attribute:t detaching ${this.value} ${flags}`);
  }

  public unbinding(flags: LifecycleFlags) {
    console.log(`custom-attribute:t unbinding ${this.value} ${flags}`);
  }
}
