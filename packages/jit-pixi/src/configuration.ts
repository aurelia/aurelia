import { JitConfiguration } from '@aurelia/jit';
import { HTMLBindingLanguage, HTMLTemplateCompiler } from '@aurelia/jit-html';
import { DI, IContainer } from '@aurelia/kernel';
import { PixiRuntimeConfiguration } from '@aurelia/runtime-pixi';

export const PixiJitConfiguration = {
  register(container: IContainer): void {
    container.register(
      PixiRuntimeConfiguration,
      ...HTMLTemplateCompiler,
      JitConfiguration,
      ...HTMLBindingLanguage
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(PixiJitConfiguration);
    return container;
  }
};
