import { IContainer, Registration } from '@aurelia/kernel';
import {
  AttrBindingBehavior,
  Compose,
  DebounceBindingBehavior,
  Else,
  If,
  ITemplateCompiler,
  OneTimeBindingBehavior,
  Repeat,
  Replaceable,
  SanitizeValueConverter,
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior,
  With,
  FromViewBindingBehavior
} from '@aurelia/runtime';
import * as ExpressionParser from './binding/expression-parser';
import {
  CallBindingCommand,
  CaptureBindingCommand,
  DefaultBindingCommand,
  DelegateBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TriggerBindingCommand,
  TwoWayBindingCommand
} from './templating/instruction-compiler';
import { TemplateCompiler } from './templating/template-compiler';
import { register } from './binding/expression-parser';

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
  FromViewBindingBehavior,
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior
];

const defaultBindingLanguage: any[] = [
  DefaultBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  FromViewBindingCommand,
  TwoWayBindingCommand,
  TriggerBindingCommand,
  DelegateBindingCommand,
  CaptureBindingCommand,
  CallBindingCommand,
  ForBindingCommand
];

export const BasicConfiguration = {
  register(container: IContainer) {
    container.register(
      ExpressionParser,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources,
      ...defaultBindingLanguage
    );
    register(container);
  }
};
