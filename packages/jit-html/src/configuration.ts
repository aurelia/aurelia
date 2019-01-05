import { JitConfiguration } from '@aurelia/jit';
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { HTMLRuntimeConfiguration } from '@aurelia/runtime-html';
import {
  CaptureBindingCommand,
  DelegateBindingCommand,
  TriggerBindingCommand
} from './binding-command';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory } from './template-element-factory';

export const TriggerBindingCommandRegistration = TriggerBindingCommand as IRegistry;
export const DelegateBindingCommandRegistration = DelegateBindingCommand as IRegistry;
export const CaptureBindingCommandRegistration = CaptureBindingCommand as IRegistry;

export const HTMLBindingLanguage = [
  TriggerBindingCommandRegistration,
  DelegateBindingCommandRegistration,
  CaptureBindingCommandRegistration
];

export const TemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const TemplateElementFactoryRegistration = HTMLTemplateElementFactory as IRegistry;

export const HTMLTemplateCompiler = [
  TemplateCompilerRegistration,
  TemplateElementFactoryRegistration
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
