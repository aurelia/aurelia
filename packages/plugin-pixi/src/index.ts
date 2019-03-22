
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { PixiApp } from './resources/custom-elements/pixi-app';
import { PixiSprite } from './resources/custom-elements/pixi-sprite';

export {
  PixiApp,
  PixiSprite
};

export const PixiAppRegistration = PixiApp as unknown as IRegistry;
export const PixiSpriteRegistration = PixiSprite as unknown as IRegistry;

/**
 * Default pixi-specific resources:
 * - Custom Elements: `pixi-app`, `pixi-sprite`
 */
export const DefaultResources: IRegistry[] = [
  PixiApp as unknown as IRegistry,
  PixiSprite as unknown as IRegistry,
];

/**
 * A DI configuration object containing pixi resource registrations.
 */
export const PixiConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return container.register(...DefaultResources);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
