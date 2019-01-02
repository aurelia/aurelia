import { DI, IContainer } from '@aurelia/kernel';
import { HTMLRuntimeConfiguration } from '@aurelia/runtime-html';

export const PixiRuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      HTMLRuntimeConfiguration
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(PixiRuntimeConfiguration);
    return container;
  }
};
