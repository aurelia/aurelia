import { JitConfiguration } from '@aurelia/jit';
import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ITemplateCompiler } from '@aurelia/runtime';
import { HTMLRuntimeConfiguration } from '@aurelia/runtime-html';
import {
  CaptureBindingCommand,
  DelegateBindingCommand,
  TriggerBindingCommand
} from './binding-command';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory, ITemplateElementFactory } from './template-element-factory';

export const HTMLBindingLanguage: IRegistry[] = [
  TriggerBindingCommand,
  DelegateBindingCommand,
  CaptureBindingCommand
];

export const HTMLTemplateCompiler: IRegistry[] = [
  Registration.singleton(ITemplateCompiler, TemplateCompiler),
  Registration.singleton(ITemplateElementFactory, HTMLTemplateElementFactory)
];

export const HTMLJitConfiguration = {
  register(container: IContainer): void {
    container.register(
      HTMLRuntimeConfiguration,
      ...HTMLTemplateCompiler,
      JitConfiguration,
      ...HTMLBindingLanguage
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLJitConfiguration);
    return container;
  }
};
