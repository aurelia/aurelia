import { bindable, customAttribute, INode, LifecycleFlags } from '@aurelia/runtime';
import { I18N, I18nService } from './i18n';
/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
@customAttribute({ name: 't' })
export class TCustomAttribute {
  // tslint:disable-next-line: prefer-readonly
  @bindable public value: string = (void 0)!;
  constructor(
    @INode private readonly node: Node,
    @I18N private readonly i18n: I18nService) {
  }

  public attaching(flags: LifecycleFlags) {
    this.i18n.updateValue(this.node, this.value);
  }
}
