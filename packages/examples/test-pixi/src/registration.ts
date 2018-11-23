import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import {
  AttrBindingBehavior,
  Compose,
  DebounceBindingBehavior,
  Else,
  FromViewBindingBehavior,
  HtmlRenderer,
  If,
  ITemplateCompiler,
  OneTimeBindingBehavior,
  Repeat,
  Replaceable,
  SanitizeValueConverter,
  // SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior,
  With
} from '@aurelia/runtime-pixi';
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
} from '@aurelia/jit';
import { ParserRegistration } from '@aurelia/jit';
import { TemplateCompiler } from '@aurelia/jit';

const globalResources: IRegistry[] = [
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
  // SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior
];

const defaultBindingLanguage: IRegistry[] = [
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
  register(container: IContainer): void {
    container.register(
      ParserRegistration,
      HtmlRenderer,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources,
      ...defaultBindingLanguage
    );
  }
};
