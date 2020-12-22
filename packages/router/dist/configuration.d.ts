import { IContainer, IRegistry } from '@aurelia/kernel';
import { NavCustomElement } from './resources/nav.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { ViewportScopeCustomElement } from './resources/viewport-scope.js';
import { GotoCustomAttribute } from './resources/goto.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
import { IRouter } from './router.js';
import { IRouterActivateOptions } from './router-options.js';
export declare const RouterRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export declare const DefaultComponents: IRegistry[];
export { ViewportCustomElement, ViewportScopeCustomElement, NavCustomElement, GotoCustomAttribute, LoadCustomAttribute, HrefCustomAttribute, };
export declare const ViewportCustomElementRegistration: IRegistry;
export declare const ViewportScopeCustomElementRegistration: IRegistry;
export declare const NavCustomElementRegistration: IRegistry;
export declare const GotoCustomAttributeRegistration: IRegistry;
export declare const LoadCustomAttributeRegistration: IRegistry;
export declare const HrefCustomAttributeRegistration: IRegistry;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
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
     * Parameter is either a config object that's passed to Router's start
     * or a config function that's called instead of Router's start.
     */
    customize(config?: IRouterActivateOptions | ((router: IRouter) => void) | undefined): {
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