import { FallbackAction } from '../router-options';
import { IEndpointOptions } from './endpoint';
export interface IViewportOptions extends Omit<Partial<ViewportOptions>, 'usedBy'> {
    usedBy?: string | string[];
}
export declare class ViewportOptions implements IEndpointOptions {
    /**
     * Whether the viewport has its own scope (owns other endpoints)
     */
    scope: boolean;
    /**
     * A list of components that is using the viewport. These components
     * can only be loaded into this viewport and this viewport can't
     * load any other components.
     */
    usedBy: string[];
    /**
     * The component loaded if the viewport can't load the specified
     * component. The component is passed as a parameter to the fallback.
     */
    fallback: string;
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction: FallbackAction | '';
    /**
     * The viewport doesn't add its content to the Location URL.
     */
    noLink: boolean;
    /**
     * The viewport doesn't add a title to the browser window title.
     */
    noTitle: boolean;
    /**
     * The viewport's content is stateful.
     */
    stateful: boolean;
    /**
     * The viewport is always added to the routing instruction.
     */
    forceDescription: boolean;
    /**
     * The transitions in the endpoint shouldn't be added to the navigation history
     */
    noHistory: boolean;
    /**
     * The default component that's loaded if the viewport is created
     * without having a component specified (in that navigation).
     * (Declared here because of name conflict.)
     */
    default: string | undefined;
    constructor(
    /**
     * Whether the viewport has its own scope (owns other endpoints)
     */
    scope?: boolean, 
    /**
     * A list of components that is using the viewport. These components
     * can only be loaded into this viewport and this viewport can't
     * load any other components.
     */
    usedBy?: string[], 
    /**
     * The default component that's loaded if the viewport is created
     * without having a component specified (in that navigation).
     */
    _default?: string, 
    /**
     * The component loaded if the viewport can't load the specified
     * component. The component is passed as a parameter to the fallback.
     */
    fallback?: string, 
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction?: FallbackAction | '', 
    /**
     * The viewport doesn't add its content to the Location URL.
     */
    noLink?: boolean, 
    /**
     * The viewport doesn't add a title to the browser window title.
     */
    noTitle?: boolean, 
    /**
     * The viewport's content is stateful.
     */
    stateful?: boolean, 
    /**
     * The viewport is always added to the routing instruction.
     */
    forceDescription?: boolean, 
    /**
     * The transitions in the endpoint shouldn't be added to the navigation history
     */
    noHistory?: boolean);
    static create(options?: IViewportOptions): ViewportOptions;
    apply(options: ViewportOptions | IViewportOptions): void;
}
//# sourceMappingURL=viewport-options.d.ts.map