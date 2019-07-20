import { IContainer, Key, PLATFORM, Registration } from '@aurelia/kernel';
import { Aurelia, Bindable, BindingMode, BindingStrategy, CustomAttribute, DOM, HooksDefinition, IAttributeDefinition, IController, ICustomAttributeResource, LifecycleFlags } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { I18N } from './i18n';
/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
export class TCustomAttribute {
  public static readonly inject: readonly Key[] = [(DOM as unknown as HTMLDOM).Element, I18N];
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

  // tslint:disable-next-line: prefer-readonly
  private value: string = (void 0)!;
  constructor(
    private readonly element: Element & { $au: Aurelia; $controller: IController },
    private readonly i18n: I18N) {

  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:t', this));
    container.register(Registration.transient(this, this));
  }

  public attaching(flags: LifecycleFlags) {
    this.i18n.updateValue(this.element, this.value, undefined);
  }

}
