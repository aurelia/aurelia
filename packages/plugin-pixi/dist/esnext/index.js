import { DI } from '@aurelia/kernel';
import { PixiApp } from './resources/custom-elements/pixi-app';
import { PixiSprite } from './resources/custom-elements/pixi-sprite';
export { PixiApp, PixiSprite };
export const PixiAppRegistration = PixiApp;
export const PixiSpriteRegistration = PixiSprite;
/**
 * Default pixi-specific resources:
 * - Custom Elements: `pixi-app`, `pixi-sprite`
 */
export const DefaultResources = [
    PixiApp,
    PixiSprite,
];
/**
 * A DI configuration object containing pixi resource registrations.
 */
export const PixiConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultResources);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=index.js.map