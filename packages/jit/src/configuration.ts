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
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior,
  With
} from '@aurelia/runtime';
import { DotSeparatedAttributePattern } from './attribute-pattern';
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
} from './binding-command';
import { ParserRegistration } from './expression-parser';
import { TemplateCompiler } from './template-compiler';

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
  SelfBindingBehavior,
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
  ForBindingCommand,
  DotSeparatedAttributePattern
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
