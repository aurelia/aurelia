import { GotoCustomAttribute } from './resources/goto';
import { IContainer, IRegistry } from '@aurelia/kernel';
import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
import { IRouter, IRouterOptions } from './router';
export declare const RouterRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export declare const DefaultComponents: IRegistry[];
export { ViewportCustomElement, NavCustomElement, GotoCustomAttribute, };
export declare const ViewportCustomElementRegistration: IRegistry;
export declare const NavCustomElementRegistration: IRegistry;
export declare const GotoCustomAttributeRegistration: IRegistry;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`
 */
export declare const DefaultResources: IRegistry[];
export declare const RouterConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(config?: IRouterOptions | ((router: IRouter) => void) | undefined): {
        /**
         * Apply this configuration to the provided container.
         */
        register(container: IContainer): IContainer;
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer(): IContainer;
    };
};
//# sourceMappingURL=configuration.d.ts.map