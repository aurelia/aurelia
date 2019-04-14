import { IContainer, IRegistry } from '@aurelia/kernel';
import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
export declare const RouterRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export declare const DefaultComponents: IRegistry[];
export { ViewportCustomElement, NavCustomElement, };
export declare const ViewportCustomElementRegistration: IRegistry;
export declare const NavCustomElementRegistration: IRegistry;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 */
export declare const DefaultResources: IRegistry[];
/**
 * A DI configuration object containing router resource registrations.
 */
export declare const RouterConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=configuration.d.ts.map