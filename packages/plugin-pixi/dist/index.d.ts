import { IContainer, IRegistry } from '@aurelia/kernel';
import { PixiApp } from './resources/custom-elements/pixi-app';
import { PixiSprite } from './resources/custom-elements/pixi-sprite';
export { PixiApp, PixiSprite };
export declare const PixiAppRegistration: IRegistry;
export declare const PixiSpriteRegistration: IRegistry;
/**
 * Default pixi-specific resources:
 * - Custom Elements: `pixi-app`, `pixi-sprite`
 */
export declare const DefaultResources: IRegistry[];
/**
 * A DI configuration object containing pixi resource registrations.
 */
export declare const PixiConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=index.d.ts.map