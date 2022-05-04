/* eslint-disable no-template-curly-in-string */
import { IContainer } from '@aurelia/kernel';
import { INavigatorOptions } from './navigator';
import { NavigationState } from './navigation-coordinator';
import { RoutingInstruction } from './instructions/routing-instruction';
import { IRoutingHookDefinition } from './routing-hook';
import { IRouter, Router, IRouterConfiguration, RouterConfiguration } from './index';
import { Navigation } from './navigation';

/**
 * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
 */
export type SwapOrder = 'attach-next-detach-current' | 'attach-detach-simultaneously' | 'detach-current-attach-next' | 'detach-attach-simultaneously';

export interface ITitleOptions extends Partial<TitleOptions> { }

/**
 * The router's title configuration
 */
export class TitleOptions {
  protected constructor(
    /**
     * The full application title. Can use placeholders `${componentTitles}`
     * and `${appTitleSeparator} for joined component titles and a separator
     * between the component titles and the application name.
     * Default: '${componentTitles}\${appTitleSeparator}Aurelia'
     */
    // eslint-disable-next-line no-useless-escape
    public appTitle: string = '${componentTitles}\${appTitleSeparator}Aurelia',

    /**
     * The separator between the joined component titles and application name.
     * Default: ' | '
     */
    public appTitleSeparator: string = ' | ',

    /**
     * In what order component titles are joined into `${componentTitles}`.
     * Default: 'top-down'
     */
    public componentTitleOrder: 'top-down' | 'bottom-up' = 'top-down',

    /**
     * The separator between the component titles. Default: ' > '
     */
    public componentTitleSeparator: string = ' > ',

    /**
     * Whether components' names should be used sa titles for components
     * that doesn't specify a title. Default: true
     */
    public useComponentNames: boolean = true,

    /**
     * Prefixes that are removed from components' names before they are
     * used as titles. Default: 'app-'
     */
    public componentPrefix: string | string[] = 'app-',

    /**
     * Function that is called for each component/route title. The
     * returned value is used instead as title. Default: undefined
     */
    public transformTitle?: (title: string, instruction: RoutingInstruction, navigation: Navigation) => string,
  ) { }

  public static create(input: string | ITitleOptions = {}): TitleOptions {
    input = typeof input === 'string' ? { appTitle: input } : input;

    return new TitleOptions(
      input.appTitle,
      input.appTitleSeparator,
      input.componentTitleOrder,
      input.componentTitleSeparator,
      input.useComponentNames,
      input.componentPrefix,
      input.transformTitle,
    );
  }

  public static for(context: IRouterConfiguration | IRouter | IContainer): TitleOptions {
    return RouterOptions.for(context).title;
  }

  public apply(input: string | ITitleOptions = {}): void {
    input = typeof input === 'string' ? { appTitle: input } : input;

    this.appTitle = input.appTitle ?? this.appTitle;
    this.appTitleSeparator = input.appTitleSeparator ?? this.appTitleSeparator;
    this.componentTitleOrder = input.componentTitleOrder ?? this.componentTitleOrder;
    this.componentTitleSeparator = input.componentTitleSeparator ?? this.componentTitleSeparator;
    this.useComponentNames = input.useComponentNames ?? this.useComponentNames;
    this.componentPrefix = input.componentPrefix ?? this.componentPrefix;
    this.transformTitle = 'transformTitle' in input ? input.transformTitle : this.transformTitle;
  }
}

export interface ISeparators extends Partial<Separators> { }

/**
 * The separators used in the direct routing syntax
 */
export class Separators {
  protected constructor(
    /**
     * The character(s) that denotes the start of viewport name
     */
    public viewport: string = '@', // ':',

    /**
     * The character(s) that separates siblings
     */
    public sibling: string = '+', // '/',

    /**
     * The character(s) that denotes the start of a new scope
     */
    public scope: string = '/', // '+',

    /**
     * The character(s) to indicate the start of a grou
     */
    public groupStart: string = '(', // ''

    /**
     * The character(s) to indicate the end of a group
     */
    public groupEnd: string = ')', // ''

    /**
     * The character(s) to indicate that the viewport doesn't have
     * a routing scope
     */
    public noScope: string = '!',

    /**
     * The character(s) that denotes the start of component parameters
     */
    public parameters: string = '(', // '='

    /**
     * The character(s) that denotes the end of component parameters
     */
    public parametersEnd: string = ')', // ''

    /**
     * The character(s) that separates component parameters
     */
    public parameterSeparator: string = ',', // '&'

    /**
     * The character(s) that separates a component parameter's key and value
     */
    public parameterKeySeparator: string = '=',

    /**
     * The character(s) that denotes that the instructions are additive/not
     * full viewport state
     */
    public add: string = '+',

    /**
     * The character(s) that denotes that a viewport or routing scope should
     * be cleared/emptied
     */
    public clear: string = '-',

    /**
     * The character(s) that denotes the start of a component method (not yet
     * implemented)
     */
    public action: string = '.',
  ) { }

  public static create(input: ISeparators = {}): Separators {
    return new Separators(
      input.viewport,
      input.sibling,
      input.scope,
      input.groupStart,
      input.groupEnd,
      input.noScope,
      input.parameters,
      input.parametersEnd,
      input.parameterSeparator,
      input.parameterKeySeparator,
      input.add,
      input.clear,
      input.action,
    );
  }

  public static for(context: IRouterConfiguration | IRouter | IContainer): Separators {
    return RouterOptions.for(context).separators;
  }

  public apply(input: ISeparators = {}): void {
    this.viewport = input.viewport ?? this.viewport;
    this.sibling = input.sibling ?? this.sibling;
    this.scope = input.scope ?? this.scope;
    this.groupStart = input.groupStart ?? this.groupStart;
    this.groupEnd = input.groupEnd ?? this.groupEnd;
    this.noScope = input.noScope ?? this.noScope;
    this.parameters = input.parameters ?? this.parameters;
    this.parametersEnd = input.parametersEnd ?? this.parametersEnd;
    this.parameterSeparator = input.parameterSeparator ?? this.parameterSeparator;
    this.parameterKeySeparator = input.parameterKeySeparator ?? this.parameterKeySeparator;
    this.add = input.add ?? this.add;
    this.clear = input.clear ?? this.clear;
    this.action = input.action ?? this.action;
  }
}

export interface IIndicators extends Partial<Indicators> { }

/**
 * The indicators used to mark different states
 */
export class Indicators {
  protected constructor(
    /**
     * The name of the class indicating that the load link is active
     */
    public loadActive: string = 'active',

    /**
     * The name of the class indicating that the viewport is navigating.
     * The different types of navigation -- first, new, back, forward and
     * refresh -- will be added as well with this class as prefix, for
     * example 'navigating-back'.
     */
    public viewportNavigating: string = 'navigating',
  ) { }

  public static create(input: IIndicators = {}): Indicators {
    return new Indicators(
      input.loadActive,
      input.viewportNavigating,
    );
  }

  public static for(context: IRouterConfiguration | IRouter | IContainer): Indicators {
    return RouterOptions.for(context).indicators;
  }

  public apply(input: IIndicators = {}): void {
    this.loadActive = input.loadActive ?? this.loadActive;
    this.viewportNavigating = input.viewportNavigating ?? this.viewportNavigating;
  }
}

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

export class RouterOptions implements INavigatorOptions {
  /**
   * The router configuration these options belong to.
   */
  public routerConfiguration!: RouterConfiguration;

  /**
   * Any routing hooks that were set during registration with
   * RouterConfiguration.customize are temporarily stored here
   * so that they can be set once properly instantiated.
   */
  private registrationHooks: IRoutingHookDefinition[] = [];

  protected constructor(
    /**
     * The separators used in the direct routing syntax
     */
    public separators: Separators = Separators.create(),

    /**
     * The indicators used to mark different states
     */
    public indicators: Indicators = Indicators.create(),

    /**
     * Whether the fragment should be used for the url/path
     */
    public useUrlFragmentHash: boolean = true,

    /**
     * The base path (base element href) for the app. If set to
     * - a string that string is used as base path,
     * - null the value is read from base element's href attribute (default).
     * The base path is removed or added to the Location url as
     * needed.
     */
    public basePath: string | null = null,

    /**
     * Whether the `href` html attribute can be used like the `load` custom attribute
     */
    public useHref: boolean = true,

    /**
     * The amount of navigation history entries that are stateful. Default: 0
     */
    public statefulHistoryLength: number = 0,

    /**
     * Whether direct routing should be used. Default: true
     */
    public useDirectRouting: boolean = true,

    /**
     * Whether configured routes should be used. Default: true
     */
    public useConfiguredRoutes: boolean = true,

    /**
     * Whether a load instruction by default is additive, that is specifying
     * the change of the state of viewports rather than the complete state
     * of viewports. Default: true
     */
    public additiveInstructionDefault: boolean = true,

    /**
     * The router's title configuration
     */
    public title: TitleOptions = TitleOptions.create(),

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
    public navigationSyncStates: NavigationState[] = ['guardedUnload', 'swapped', 'completed'],

    /**
     * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
     */
    public swapOrder: SwapOrder = 'attach-next-detach-current',
  ) { }

  public static create(input: IRouterOptions = {}): RouterOptions {
    return new RouterOptions(
      Separators.create(input.separators),
      Indicators.create(input.indicators),
      input.useUrlFragmentHash,
      input.basePath,
      input.useHref,
      input.statefulHistoryLength,
      input.useDirectRouting,
      input.useConfiguredRoutes,
      input.additiveInstructionDefault,
      TitleOptions.create(input.title),
      input.navigationSyncStates,
      input.swapOrder,
    );
  }

  public static for(context: IRouterConfiguration | IRouter | IContainer): RouterOptions {
    if (context instanceof RouterConfiguration) {
      return context.options;
    }
    if (context instanceof Router) {
      context = context.configuration;
    } else {
      context = context.get(IRouterConfiguration);
    }
    return context.options;
  }

  /**
   * Apply router options.
   *
   * @param options - The options to apply
   */
  public apply(options: IRouterOptions): void {
    options = options ?? {};
    this.separators.apply(options.separators);
    this.indicators.apply(options.indicators);
    this.useUrlFragmentHash = options.useUrlFragmentHash ?? this.useUrlFragmentHash;
    this.useHref = options.useHref ?? this.useHref;
    this.statefulHistoryLength = options.statefulHistoryLength ?? this.statefulHistoryLength;
    this.useDirectRouting = options.useDirectRouting ?? this.useDirectRouting;
    this.useConfiguredRoutes = options.useConfiguredRoutes ?? this.useConfiguredRoutes;
    this.additiveInstructionDefault = options.additiveInstructionDefault ?? this.additiveInstructionDefault;
    this.title.apply(options.title);
    this.navigationSyncStates = options.navigationSyncStates ?? this.navigationSyncStates;
    this.swapOrder = options.swapOrder ?? this.swapOrder;

    // TODO: Fix RoutingHooks!
    if (Array.isArray(options.hooks)) {
      if (this.routerConfiguration !== void 0) {
        options.hooks.forEach(hook => this.routerConfiguration.addHook(hook.hook, hook.options));
      } else {
        this.registrationHooks = options.hooks;
      }
    }
  }

  public setRouterConfiguration(routerConfiguration: RouterConfiguration): void {
    this.routerConfiguration = routerConfiguration;

    // Set previously configured routing hooks
    // TODO: Fix RoutingHooks!
    this.registrationHooks.forEach(hook => this.routerConfiguration.addHook(hook.hook, hook.options));
    this.registrationHooks.length = 0;
  }
}
