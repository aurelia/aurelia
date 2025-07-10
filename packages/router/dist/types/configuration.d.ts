import { IContainer, IRegistry } from '@aurelia/kernel';
import { IRouterOptions as $IRouterOptions } from './options';
import { ViewportCustomElement } from './resources/viewport';
import { LoadCustomAttribute } from './resources/load';
import { HrefCustomAttribute } from './resources/href';
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
export interface IRouterConfigurationOptions extends $IRouterOptions {
    /**
     * Set a custom routing root by setting this path.
     * When not set, path from the `document.baseURI` is used by default.
     */
    basePath?: string | null;
}
export declare const RouterConfiguration: {
    register(container: IContainer): IContainer;
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(options?: IRouterConfigurationOptions): IRegistry;
};
//# sourceMappingURL=configuration.d.ts.map