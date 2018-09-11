import { IContainer, Registration } from '@aurelia/kernel';
import {
  AttrBindingBehavior,
  Compose,
  DebounceBindingBehavior,
  Else,
  FromViewBindingBehavior,
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
  With
} from '@aurelia/runtime';
import { register } from './binding/expression-parser';
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
} from './templating/binding-command';
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
    register(container);
    container.register(
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources,
      ...defaultBindingLanguage
    );
  }
};
