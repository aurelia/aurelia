import { IContainer, Registration } from '@aurelia/kernel';
import { AttrBindingBehavior, Compose, DebounceBindingBehavior, Else, If, ITemplateCompiler, OneTimeBindingBehavior, Repeat, Replaceable, SanitizeValueConverter, SelfBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior, UpdateTriggerBindingBehavior, With } from '@aurelia/runtime';
import * as ExpressionParser from './binding/expression-parser';
import { TemplateCompiler } from './templating/template-compiler';

const globalResources: any[] = [
  Compose,
  If,
  Else,
  Repeat,
  Replaceable,
  With,
  SanitizeValueConverter,
  AttrBindingBehavior,
  DebounceBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior
];

export const BasicConfiguration = {
  register(container: IContainer) { 
    container.register(
      ExpressionParser,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources
    );
  }
}
