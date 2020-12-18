/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/* eslint-disable no-template-curly-in-string */
import { INavigatorOptions } from './navigator.js';
import { IHookDefinition } from './hook-manager.js';
import { NavigationState } from './navigation-coordinator.js';
import { Navigation } from './navigation.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { FoundRoute } from './found-route.js';

export type SwapStrategy = 'add-first-sequential' | 'add-first-parallel' | 'remove-first-sequential' | 'remove-first-parallel';
export type RoutingHookIntegration = 'integrated' | 'separate';

/**
 * Public API
 */
export interface IRouterStartOptions extends Omit<Partial<RouterOptions>, 'title'> {
  title?: string | IRouterTitle;

  // The below needed until interface can extend static class properties
  separators?: ISeparators;

  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  useDirectRoutes?: boolean;
  useConfiguredRoutes?: boolean;
  additiveInstructionDefault?: boolean;
  hooks?: IHookDefinition[];

  navigationSyncStates?: NavigationState[];
  swapStrategy?: SwapStrategy;
  routingHookIntegration?: RoutingHookIntegration;
}

export interface IRouterTitle extends Partial<ITitleConfiguration> { }

/**
 * Public API
 */
export interface ITitleConfiguration {
  appTitle: string;
  appTitleSeparator: string;
  componentTitleOrder: 'top-down' | 'bottom-up';
  componentTitleSeparator: string;
  useComponentNames: boolean;
  componentPrefix: string;
  transformTitle?: (title: string, instruction: string | RoutingInstruction | FoundRoute) => string;
}

export interface IRouteSeparators extends Partial<ISeparators> { }

export interface ISeparators {
  viewport: string;
  sibling: string;
  scope: string;
  scopeStart: string;
  scopeEnd: string;
  noScope: string;
  parameters: string;
  parametersEnd: string;
  parameterSeparator: string;
  parameterKeySeparator: string;
  parameter?: string;
  add: string;
  clear: string;
  action: string;
}

export class RouterOptions implements INavigatorOptions {
  public static separators: ISeparators = {
    viewport: '@', // ':',
    sibling: '+', // '/',
    scope: '/', // '+',
    scopeStart: '(', // ''
    scopeEnd: ')', // ''
    noScope: '!',
    parameters: '(', // '='
    parametersEnd: ')', // ''
    parameterSeparator: ',',
    parameterKeySeparator: '=',
    parameter: '&',
    add: '+',
    clear: '-',
    action: '.',
  };

  public static useUrlFragmentHash: boolean = true;
  public static useHref: boolean = true;
  public static statefulHistoryLength: number = 0;
  public static useDirectRoutes: boolean = true;
  public static useConfiguredRoutes: boolean = true;
  public static additiveInstructionDefault: boolean = true;
  public static title: ITitleConfiguration = {
    // eslint-disable-next-line no-useless-escape
    appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
    appTitleSeparator: ' | ',
    componentTitleOrder: 'top-down',
    componentTitleSeparator: ' > ',
    useComponentNames: true,
    componentPrefix: 'app-',
  };
  public static hooks?: IHookDefinition[];
  public static reportCallback?(instruction: Navigation): void;

  public static navigationSyncStates: NavigationState[] = ['guardedUnload', 'swapped', 'completed'];
  public static swapStrategy: SwapStrategy = 'add-first-sequential';
  public static routingHookIntegration: RoutingHookIntegration = 'integrated';

  public static resetDefaults(): void {
    RouterOptions.separators = {
      viewport: '@', // ':',
      sibling: '+', // '/',
      scope: '/', // '+',
      scopeStart: '(', // ''
      scopeEnd: ')', // ''
      noScope: '!',
      parameters: '(', // '='
      parametersEnd: ')', // ''
      parameterSeparator: ',',
      parameterKeySeparator: '=',
      parameter: '&',
      add: '+',
      clear: '-',
      action: '.',
    };

    RouterOptions.useUrlFragmentHash = true;
    RouterOptions.useHref = true;
    RouterOptions.statefulHistoryLength = 0;
    RouterOptions.useDirectRoutes = true;
    RouterOptions.useConfiguredRoutes = true;
    RouterOptions.additiveInstructionDefault = true;
    RouterOptions.title = {
      // eslint-disable-next-line no-useless-escape
      appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
      appTitleSeparator: ' | ',
      componentTitleOrder: 'top-down',
      componentTitleSeparator: ' > ',
      useComponentNames: true,
      componentPrefix: 'app-',
    };
    RouterOptions.hooks = [];

    RouterOptions.navigationSyncStates = ['guardedUnload', 'swapped', 'completed'];
    RouterOptions.swapStrategy = 'add-first-sequential';
    RouterOptions.routingHookIntegration = 'integrated';
  }
}
