import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { DotSeparatedAttributePattern, RefAttributePattern } from './attribute-pattern';
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

export const BasicBindingSyntax: IRegistry[] = [
  DotSeparatedAttributePattern,
  RefAttributePattern
];

export const BasicBindingLanguage: IRegistry[] = [
  CallBindingCommand,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand
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
