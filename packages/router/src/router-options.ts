/* eslint-disable no-template-curly-in-string */
import { INavigatorOptions } from './navigator.js';
import { NavigationState } from './navigation-coordinator.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { FoundRoute } from './found-route.js';
import { IRoutingHookDefinition } from './routing-hook.js';

/**
 * How contents are swapped in a viewport when transitioning. Default: `add-first-sequential`
 */
export type SwapStrategy = 'add-first-sequential' | 'add-first-parallel' | 'remove-first-sequential' | 'remove-first-parallel';

/**
 * The options that can be provided to the router's `start` method
 */
export interface IRouterStartOptions extends Omit<Partial<RouterOptions>, 'title'> {
  /**
   * The router's title configuration
   */
  title?: string | IRouterTitle;

  // The below needed until interface can extend static class properties

  /**
   * The separators used in the direct routing syntax
   */
  separators?: ISeparators;

  /**
   * Whether the fragment should be used for the url/path
   */
  useUrlFragmentHash?: boolean;

  /**
   * Whether the `href` html attribute can be used like the `load` custom attribute
   */
  useHref?: boolean;

  /**
   * The amount of navigation history entries that are stateful. Default: 0
   */
  statefulHistoryLength?: number;

  /**
   * Whether direct routing should be used. Default: true
   */
  useDirectRouting?: boolean;

  /**
   * Whether configured routes should be used. Default: true
   */
  useConfiguredRoutes?: boolean;
  /**
   * Whether a load instruction by default is additive, that is specifying
   * the change of the state of viewports rather than the complete state
   * of viewports. Default: true
   */
  additiveInstructionDefault?: boolean;

  /**
   * Global routing hooks that should be added from the start
   */
  hooks?: IRoutingHookDefinition[];

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
  navigationSyncStates?: NavigationState[];

  /**
   * How contents are swapped in a viewport when transitioning. Default: `add-first-sequential`
   */
  swapStrategy?: SwapStrategy;
}

/**
 * The router's title configuration
 */
export interface IRouterTitle extends Partial<ITitleConfiguration> { }

/**
 * The router's title configuration
 */
export interface ITitleConfiguration {
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
  transformTitle?: (title: string, instruction: string | RoutingInstruction | FoundRoute) => string;
}

export interface IRouteSeparators extends Partial<ISeparators> { }

/**
 * The separators used in the direct routing syntax
 */
export interface ISeparators {
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
   * The character(s) to indicate the start of a grouped scope
   */
  scopeStart: string;

  /**
   * The character(s) to indicate the end of a grouped scope
   */
  scopeEnd: string;

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
}

interface IRouterOptions extends RouterOptions { }

export class RouterOptions implements INavigatorOptions {
  /**
   * The separators used in the direct routing syntax
   */
  public static separators: ISeparators = {
    viewport: '@', // ':',
    sibling: '+', // '/',
    scope: '/', // '+',
    scopeStart: '(', // ''
    scopeEnd: ')', // ''
    noScope: '!',
    parameters: '(', // '='
    parametersEnd: ')', // ''
    parameterSeparator: ',', // '&'
    parameterKeySeparator: '=',
    add: '+',
    clear: '-',
    action: '.',
  };

  /**
   * Whether the fragment should be used for the url/path
   */
  public static useUrlFragmentHash: boolean = true;

  /**
   * Whether the `href` html attribute can be used like the `load` custom attribute
   */
  public static useHref: boolean = true;

  /**
   * The amount of navigation history entries that are stateful. Default: 0
   */
  public static statefulHistoryLength: number = 0;

  /**
   * Whether direct routing should be used. Default: true
   */
  public static useDirectRouting: boolean = true;

  /**
   * Whether configured routes should be used. Default: true
   */
  public static useConfiguredRoutes: boolean = true;

  /**
   * Whether a load instruction by default is additive, that is specifying
   * the change of the state of viewports rather than the complete state
   * of viewports. Default: true
   */
  public static additiveInstructionDefault: boolean = true;

  /**
   * The router's title configuration
   */
  public static title: ITitleConfiguration = {
    // eslint-disable-next-line no-useless-escape
    appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
    appTitleSeparator: ' | ',
    componentTitleOrder: 'top-down',
    componentTitleSeparator: ' > ',
    useComponentNames: true,
    componentPrefix: 'app-',
  };

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
  public static navigationSyncStates: NavigationState[] = ['guardedUnload', 'swapped', 'completed'];

  /**
   * How contents are swapped in a viewport when transitioning. Default: `add-first-sequential`
   */
  public static swapStrategy: SwapStrategy = 'add-first-sequential';

  /**
   * The default router options
   */
  private static readonly DEFAULT_OPTIONS: IRouterOptions = JSON.parse(JSON.stringify({ ...RouterOptions })) as IRouterOptions;

  /**
   * Apply router options.
   *
   * @param options - The options to apply
   * @param firstResetDefaults - Whether the default router options should
   * be set before applying the specified options
   */
  public static apply(options: IRouterStartOptions, firstResetDefaults: boolean): void {
    Object.assign(RouterOptions, firstResetDefaults ? RouterOptions.DEFAULT_OPTIONS : {}, options);
  }
}
