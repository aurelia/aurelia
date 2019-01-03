import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { HTMLRuntimeConfiguration } from '@aurelia/runtime-html';
import { PixiApp } from './resources/custom-elements/pixi-app';
import { PixiSprite } from './resources/custom-elements/pixi-sprite';

export const PixiGlobalResources: IRegistry[] = [
  PixiApp,
  PixiSprite
];

export const PixiRuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      HTMLRuntimeConfiguration,
      ...PixiGlobalResources
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(PixiRuntimeConfiguration);
    return container;
  }
};
