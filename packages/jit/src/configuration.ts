import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern
} from './attribute-pattern';
import {
  CallBindingCommand,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand
} from './binding-command';
import { ParserRegistration } from './expression-parser';

export const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern as IRegistry;
export const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern as IRegistry;
export const RefAttributePatternRegistration = RefAttributePattern as IRegistry;
export const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern as IRegistry;

export const BasicBindingSyntax = [
  RefAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration
];

export const ShortHandBindingSyntax = [
  AtPrefixedTriggerAttributePatternRegistration,
  ColonPrefixedBindAttributePatternRegistration
];

export const FullBindingSyntax = [
  ...BasicBindingSyntax,
  ...ShortHandBindingSyntax
];

export const CallBindingCommandRegistration = CallBindingCommand as IRegistry;
export const DefaultBindingCommandRegistration = DefaultBindingCommand as IRegistry;
export const ForBindingCommandRegistration = ForBindingCommand as IRegistry;
export const FromViewBindingCommandRegistration = FromViewBindingCommand as IRegistry;
export const OneTimeBindingCommandRegistration = OneTimeBindingCommand as IRegistry;
export const ToViewBindingCommandRegistration = ToViewBindingCommand as IRegistry;
export const TwoWayBindingCommandRegistration = TwoWayBindingCommand as IRegistry;

export const BasicBindingLanguage = [
  CallBindingCommandRegistration,
  DefaultBindingCommandRegistration,
  ForBindingCommandRegistration,
  FromViewBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  ToViewBindingCommandRegistration,
  TwoWayBindingCommandRegistration,
];

export const JitConfiguration = {
  register(container: IContainer): void {
    container.register(
      ParserRegistration,
      ...BasicBindingSyntax,
      ...BasicBindingLanguage
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(JitConfiguration);
    return container;
  }
};
