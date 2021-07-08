import { IContainer, IRegistry } from '@aurelia/kernel';
import { IRouterOptions, IRouter } from './router.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
export declare const RouterRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export declare const DefaultComponents: IRegistry[];
export { ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute, };
export declare const ViewportCustomElementRegistration: IRegistry;
export declare const LoadCustomAttributeRegistration: IRegistry;
export declare const HrefCustomAttributeRegistration: IRegistry;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
export declare const DefaultResources: IRegistry[];
export declare type RouterConfig = IRouterOptions | ((router: IRouter) => ReturnType<IRouter['start']>);
export declare const RouterConfiguration: {
    register(container: IContainer): IContainer;
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(config?: IRouterOptions | ((router: IRouter) => ReturnType<IRouter['start']>) | undefined): IRegistry;
};
//# sourceMappingURL=configuration.d.ts.map