import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression } from '../utils';
import { relativeTimeValueConverterName } from './relative-time-value-converter';

@bindingBehavior(relativeTimeValueConverterName)
export class RelativeTimeBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(relativeTimeValueConverterName, binding);
  }
}
