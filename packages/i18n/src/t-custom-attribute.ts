import { bindable, customAttribute, INode, LifecycleFlags } from '@aurelia/runtime';
import { I18N, I18nService } from './i18n';

// TODO write unit tests
/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
@customAttribute({ name: 't' })
export class TCustomAttribute {
  @bindable public value: string = (void 0)!;
  constructor(
    @INode private readonly node: Node,
    @I18N private readonly i18n: I18nService) {
  }

  public binding(flags: LifecycleFlags) {
    this.ensureStringValue();
    return this.i18n.updateValue(this.node, this.value);
  }

  private ensureStringValue() {
    const valueType = typeof this.value;
    if (valueType !== 'string') {
      throw new Error(`Only string value is supported by the localization attribute, found value of type ${valueType}`);
    }
  }
}
