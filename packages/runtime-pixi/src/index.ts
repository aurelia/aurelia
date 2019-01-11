
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { PixiApp } from './resources/custom-elements/pixi-app';
import { PixiSprite } from './resources/custom-elements/pixi-sprite';

export {
  PixiApp,
  PixiSprite
};

export const PixiAppRegistration = PixiApp as IRegistry;
export const PixiSpriteRegistration = PixiSprite as IRegistry;

/**
 * Default pixi-specific resources:
 * - Custom Elements: `pixi-app`, `pixi-sprite`
 */
export const DefaultResources: IRegistry[] = [
  PixiApp,
  PixiSprite
];

/**
 * A DI configuration object containing html-, pixi- and browser-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html-browser`
 * - `DefaultResources`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeHtmlBrowserConfiguration
      .register(container)
      .register(...DefaultResources);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
