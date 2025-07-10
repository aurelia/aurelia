import { IContainer } from '@aurelia/kernel';
import { INavigatorOptions } from './navigator';
import { NavigationState } from './navigation-coordinator';
import { RoutingInstruction } from './instructions/routing-instruction';
import { IRoutingHookDefinition } from './routing-hook';
import { IRouter, IRouterConfiguration, RouterConfiguration, ComponentAppellation } from './index';
import { Navigation } from './navigation';
/**
 * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
 */
export type SwapOrder = 'attach-next-detach-current' | 'attach-detach-simultaneously' | 'detach-current-attach-next' | 'detach-attach-simultaneously';
export interface ITitleOptions extends Partial<TitleOptions> {
}
/**
 * The router's title configuration
 */
export declare class TitleOptions {
    /**
     * The full application title. Can use placeholders `${componentTitles}`
     * and `${appTitleSeparator} for joined component titles and a separator
     * between the component titles and the application name.
     * Default: '${componentTitles}\${appTitleSeparator}Aurelia'
     */
    appTitle: string;
    /**
     * The separator between the joined component titles and application name.
     * Default: ' | '
     */
    appTitleSeparator: string;
    /**
     * In what order component titles are joined into `${componentTitles}`.
     * Default: 'top-down'
     */
    componentTitleOrder: 'top-down' | 'bottom-up';
    /**
     * The separator between the component titles. Default: ' > '
     */
    componentTitleSeparator: string;
    /**
     * Whether components' names should be used sa titles for components
     * that doesn't specify a title. Default: true
     */
    useComponentNames: boolean;
    /**
     * Prefixes that are removed from components' names before they are
     * used as titles. Default: 'app-'
     */
    componentPrefix: string | string[];
    /**
     * Function that is called for each component/route title. The
     * returned value is used instead as title. Default: undefined
     */
    transformTitle?: ((title: string, instruction: RoutingInstruction, navigation: Navigation) => string) | undefined;
    protected constructor(
    /**
     * The full application title. Can use placeholders `${componentTitles}`
     * and `${appTitleSeparator} for joined component titles and a separator
     * between the component titles and the application name.
     * Default: '${componentTitles}\${appTitleSeparator}Aurelia'
     */
    appTitle?: string, 
    /**
     * The separator between the joined component titles and application name.
     * Default: ' | '
     */
    appTitleSeparator?: string, 
    /**
     * In what order component titles are joined into `${componentTitles}`.
     * Default: 'top-down'
     */
    componentTitleOrder?: 'top-down' | 'bottom-up', 
    /**
     * The separator between the component titles. Default: ' > '
     */
    componentTitleSeparator?: string, 
    /**
     * Whether components' names should be used sa titles for components
     * that doesn't specify a title. Default: true
     */
    useComponentNames?: boolean, 
    /**
     * Prefixes that are removed from components' names before they are
     * used as titles. Default: 'app-'
     */
    componentPrefix?: string | string[], 
    /**
     * Function that is called for each component/route title. The
     * returned value is used instead as title. Default: undefined
     */
    transformTitle?: ((title: string, instruction: RoutingInstruction, navigation: Navigation) => string) | undefined);
    static create(input?: string | ITitleOptions): TitleOptions;
    static for(context: IRouterConfiguration | IRouter | IContainer): TitleOptions;
    apply(input?: string | ITitleOptions): void;
}
export interface ISeparators extends Partial<Separators> {
}
/**
 * The separators used in the direct routing syntax
 */
export declare class Separators {
    /**
     * The character(s) that denotes the start of viewport name
     */
    viewport: string;
    /**
     * The character(s) that separates siblings
     */
    sibling: string;
    /**
     * The character(s) that denotes the start of a new scope
     */
    scope: string;
    /**
     * The character(s) to indicate the start of a grou
     */
    groupStart: string;
    /**
     * The character(s) to indicate the end of a group
     */
    groupEnd: string;
    /**
     * The character(s) to indicate that the viewport doesn't have
     * a routing scope
     */
    noScope: string;
    /**
     * The character(s) that denotes the start of component parameters
     */
    parameters: string;
    /**
     * The character(s) that denotes the end of component parameters
     */
    parametersEnd: string;
    /**
     * The character(s) that separates component parameters
     */
    parameterSeparator: string;
    /**
     * The character(s) that separates a component parameter's key and value
     */
    parameterKeySeparator: string;
    /**
     * The character(s) that denotes that the instructions are additive/not
     * full viewport state
     */
    add: string;
    /**
     * The character(s) that denotes that a viewport or routing scope should
     * be cleared/emptied
     */
    clear: string;
    /**
     * The character(s) that denotes the start of a component method (not yet
     * implemented)
     */
    action: string;
    protected constructor(
    /**
     * The character(s) that denotes the start of viewport name
     */
    viewport?: string, // ':',
    /**
     * The character(s) that separates siblings
     */
    sibling?: string, // '/',
    /**
     * The character(s) that denotes the start of a new scope
     */
    scope?: string, // '+',
    /**
     * The character(s) to indicate the start of a grou
     */
    groupStart?: string, // ''
    /**
     * The character(s) to indicate the end of a group
     */
    groupEnd?: string, // ''
    /**
     * The character(s) to indicate that the viewport doesn't have
     * a routing scope
     */
    noScope?: string, 
    /**
     * The character(s) that denotes the start of component parameters
     */
    parameters?: string, // '='
    /**
     * The character(s) that denotes the end of component parameters
     */
    parametersEnd?: string, // ''
    /**
     * The character(s) that separates component parameters
     */
    parameterSeparator?: string, // '&'
    /**
     * The character(s) that separates a component parameter's key and value
     */
    parameterKeySeparator?: string, 
    /**
     * The character(s) that denotes that the instructions are additive/not
     * full viewport state
     */
    add?: string, 
    /**
     * The character(s) that denotes that a viewport or routing scope should
     * be cleared/emptied
     */
    clear?: string, 
    /**
     * The character(s) that denotes the start of a component method (not yet
     * implemented)
     */
    action?: string);
    static create(input?: ISeparators): Separators;
    static for(context: IRouterConfiguration | IRouter | IContainer): Separators;
    apply(input?: ISeparators): void;
}
export interface IIndicators extends Partial<Indicators> {
}
/**
 * The indicators used to mark different states
 */
export declare class Indicators {
    /**
     * The name of the class indicating that the load link is active
     */
    loadActive: string;
    /**
     * The name of the class indicating that the viewport is navigating.
     * The different types of navigation -- first, new, back, forward and
     * refresh -- will be added as well with this class as prefix, for
     * example 'navigating-back'.
     */
    viewportNavigating: string;
    protected constructor(
    /**
     * The name of the class indicating that the load link is active
     */
    loadActive?: string, 
    /**
     * The name of the class indicating that the viewport is navigating.
     * The different types of navigation -- first, new, back, forward and
     * refresh -- will be added as well with this class as prefix, for
     * example 'navigating-back'.
     */
    viewportNavigating?: string);
    static create(input?: IIndicators): Indicators;
    static for(context: IRouterConfiguration | IRouter | IContainer): Indicators;
    apply(input?: IIndicators): void;
}
export type FallbackAction = 'abort' | 'process-children';
export interface IRouterOptions extends Omit<Partial<RouterOptions>, 'separators' | 'indicators' | 'title'> {
    /**
     * The router's title configuration
     */
    title?: string | ITitleOptions;
    /**
     * The separators used in the direct routing syntax
     */
    separators?: ISeparators;
    /**
     * The indicators used to mark different states
     */
    indicators?: IIndicators;
    /**
     * Global routing hooks that should be added (primarily from start)
     */
    hooks?: IRoutingHookDefinition[];
}
export declare class RouterOptions implements INavigatorOptions {
    /**
     * The separators used in the direct routing syntax
     */
    separators: Separators;
    /**
     * The indicators used to mark different states
     */
    indicators: Indicators;
    /**
     * Whether the fragment should be used for the url/path
     */
    useUrlFragmentHash: boolean;
    /**
     * The base path (base element href) for the app. If set to
     * - a string that string is used as base path,
     * - null the value is read from base element's href attribute (default).
     * The base path is removed or added to the Location url as
     * needed.
     */
    basePath: string | null;
    /**
     * Whether the `href` html attribute can be used like the `load` custom attribute
     */
    useHref: boolean;
    /**
     * The amount of navigation history entries that are stateful. Default: 0
     */
    statefulHistoryLength: number;
    /**
     * Whether direct routing should be used. Default: true
     */
    useDirectRouting: boolean;
    /**
     * Whether configured routes should be used. Default: true
     */
    useConfiguredRoutes: boolean;
    /**
     * Whether a load instruction by default is a complete state navigation,
     * for all viewports, or a partial state navigation that is only specifying
     * the change of the new state of specified viewports. Default: false
     */
    completeStateNavigations: boolean;
    /**
     * The router's title configuration
     */
    title: TitleOptions;
    /**
     * The navigation states that are synced meaning that sibling viewports
     * will wait for all other siblings to reach the navigation state before
     * continuing with the next steps in the transition. For example, the
     * `guardedUnload` sync state means that no sibling will continue with
     * the `canLoad` hook before all siblings have completed the `canUnload`
     * hooks. To get v1 routing hook behavior, where all routing hooks are
     * synced,`guardedLoad`, `unload` and `load` should be added to default.
     * Default: `guardedUnload`, `swapped`, `completed`
     */
    navigationSyncStates: NavigationState[];
    /**
     * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
     */
    swapOrder: SwapOrder;
    /**
     * The component to be loaded if a specified can't be loaded.
     * The unloadable component is passed as a parameter to the fallback.
     */
    fallback: ComponentAppellation;
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction: FallbackAction;
    /**
     * The router configuration these options belong to.
     */
    routerConfiguration: RouterConfiguration;
    /**
     * Any routing hooks that were set during registration with
     * RouterConfiguration.customize are temporarily stored here
     * so that they can be set once properly instantiated.
     */
    private registrationHooks;
    protected constructor(
    /**
     * The separators used in the direct routing syntax
     */
    separators?: Separators, 
    /**
     * The indicators used to mark different states
     */
    indicators?: Indicators, 
    /**
     * Whether the fragment should be used for the url/path
     */
    useUrlFragmentHash?: boolean, 
    /**
     * The base path (base element href) for the app. If set to
     * - a string that string is used as base path,
     * - null the value is read from base element's href attribute (default).
     * The base path is removed or added to the Location url as
     * needed.
     */
    basePath?: string | null, 
    /**
     * Whether the `href` html attribute can be used like the `load` custom attribute
     */
    useHref?: boolean, 
    /**
     * The amount of navigation history entries that are stateful. Default: 0
     */
    statefulHistoryLength?: number, 
    /**
     * Whether direct routing should be used. Default: true
     */
    useDirectRouting?: boolean, 
    /**
     * Whether configured routes should be used. Default: true
     */
    useConfiguredRoutes?: boolean, 
    /**
     * Whether a load instruction by default is a complete state navigation,
     * for all viewports, or a partial state navigation that is only specifying
     * the change of the new state of specified viewports. Default: false
     */
    completeStateNavigations?: boolean, 
    /**
     * The router's title configuration
     */
    title?: TitleOptions, 
    /**
     * The navigation states that are synced meaning that sibling viewports
     * will wait for all other siblings to reach the navigation state before
     * continuing with the next steps in the transition. For example, the
     * `guardedUnload` sync state means that no sibling will continue with
     * the `canLoad` hook before all siblings have completed the `canUnload`
     * hooks. To get v1 routing hook behavior, where all routing hooks are
     * synced,`guardedLoad`, `unload` and `load` should be added to default.
     * Default: `guardedUnload`, `swapped`, `completed`
     */
    navigationSyncStates?: NavigationState[], 
    /**
     * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
     */
    swapOrder?: SwapOrder, 
    /**
     * The component to be loaded if a specified can't be loaded.
     * The unloadable component is passed as a parameter to the fallback.
     */
    fallback?: ComponentAppellation, 
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction?: FallbackAction);
    static create(input?: IRouterOptions): RouterOptions;
    static for(context: IRouterConfiguration | IRouter | IContainer): RouterOptions;
    /**
     * Apply router options.
     *
     * @param options - The options to apply
     */
    apply(options: IRouterOptions): void;
    setRouterConfiguration(routerConfiguration: RouterConfiguration): void;
}
//# sourceMappingURL=router-options.d.ts.map