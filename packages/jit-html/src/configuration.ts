import { JitConfiguration } from '@aurelia/jit';
import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ITemplateCompiler } from '@aurelia/runtime';
import {
  CaptureBindingCommand,
  DelegateBindingCommand,
  TriggerBindingCommand
} from './binding-command';
import { TemplateCompiler } from './template-compiler';

export const HTMLBindingLanguage: IRegistry[] = [
  TriggerBindingCommand,
  DelegateBindingCommand,
  CaptureBindingCommand
];

export const HTMLJitConfiguration = {
  register(container: IContainer): void {
    container.register(
      JitConfiguration,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...HTMLBindingLanguage
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLJitConfiguration);
    return container;
  }
};
