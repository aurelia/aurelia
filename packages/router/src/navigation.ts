import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { INavigationFlags } from './navigator.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { RoutingScope } from './routing-scope.js';

export interface IStoredNavigation extends Omit<StoredNavigation, 'navigation' | 'toStoredNavigation'> {
  navigation?: INavigationFlags;
}

/**
 * The stored navigation holds the part of a navigation that's stored
 * in history. Note that the data might not be json serializable and
 * therefore might not be able to be stored as-is.
 */
export class StoredNavigation {
  /**
   * The navigation in a historical context (back, forward, etc)
   */
  public navigation: INavigationFlags;

  /**
   * Whether this is a repeating navigation, in other words the same navigation run again
   */
  public repeating?: boolean;

  /**
   * The routing instruction for the navigation
   */
  public instruction: string | RoutingInstruction[];
  /**
   * A routing instruction describing the full navigational state once
   * this navigation has been performed. Used when restoring a previous
   * state.
   */
  public fullStateInstruction: string | RoutingInstruction[];

  /**
   * The starting scope of the navigation
   */
  public scope?: RoutingScope | null;

  /**
   * The historical index of the navigation
   */
  public index?: number;

  /**
   * Whether the navigation is the first in the sesseion. Index might change
   * to not require first === 0, firstEntry should be reliable
   */
  public firstEntry?: boolean;
  // public route?: Route;

  /**
   * The URL (Location) path of the navigation
   */
  public path?: string;

  /**
   * The (resulting) title of the navigation
   */
  public title?: string;

  /**
   * The query of the navigation
   */
  public query?: string;

  /**
   * The parameters of the navigation
   */
  public parameters?: Record<string, unknown>;

  /**
   * The data of the navigation
   */
  public data?: Record<string, unknown>;

  public constructor(entry: IStoredNavigation = {
    instruction: '',
    fullStateInstruction: '',
  }) {
    this.navigation = entry.navigation ?? {
      first: false,
      new: false,
      refresh: false,
      forward: false,
      back: false,
      replace: false,
    };
    this.repeating = entry.repeating;

    this.instruction = entry.instruction;
    this.fullStateInstruction = entry.fullStateInstruction;
    this.scope = entry.scope;
    this.index = entry.index;
    this.firstEntry = entry.firstEntry;
    // this.route = entry.route;
    this.path = entry.path;
    this.title = entry.title;
    this.query = entry.query;
    this.parameters = entry.parameters;
    this.data = entry.data;
  }

  public toStoredNavigation(): IStoredNavigation {
    return {
      navigation: this.navigation,
      repeating: this.repeating,

      instruction: this.instruction,
      fullStateInstruction: this.fullStateInstruction,
      scope: this.scope,
      index: this.index,
      firstEntry: this.firstEntry,
      // route: this.route,
      path: this.path,
      title: this.title,
      query: this.query,
      parameters: this.parameters,
      data: this.data,
    };
  }
}

export interface INavigation extends Omit<Navigation, 'navigation' | 'toStoredNavigation' | 'useFullStateInstruction'> { }

/**
 * The navigation
 */

export class Navigation extends StoredNavigation {
  /**
   * The previous navigation
   */
  public previous?: Navigation;

  /**
   * Whether the navigation originates from a browser action (back, forward)
   */
  public fromBrowser?: boolean;

  /**
   * The origin of the navigation, a view model or element
   */
  public origin?: ICustomElementViewModel | Element;

  /**
   * Whether this navigation is fully replacing a previous one
   */
  public replacing?: boolean;

  /**
   * Whether this navigation is a refresh/reload with the same parameters
   */
  public refreshing?: boolean;

  /**
   * Whether this navigation is untracked and shouldn't be added to history
   */
  public untracked?: boolean;

  /**
   * How the navigation has moved in history compared to previous navigation
   */
  public historyMovement?: number;

  /**
   * Called when the navigation is resolved
   */
  public resolve?: ((value?: boolean | PromiseLike<boolean>) => void);
  /**
   * Called when the navigation is rejected
   */
  public reject?: ((value?: boolean | PromiseLike<boolean>) => void);

  public constructor(entry: INavigation = {
    instruction: '',
    fullStateInstruction: '',
  }) {
    super(entry);

    this.fromBrowser = entry.fromBrowser;
    this.origin = entry.origin;
    this.replacing = entry.replacing;
    this.refreshing = entry.refreshing;
    this.untracked = entry.untracked;
    this.historyMovement = entry.historyMovement;
    this.resolve = entry.resolve;
    this.reject = entry.reject;
  }

  public get useFullStateInstruction(): boolean {
    return (this.navigation.back ?? false) || (this.navigation.forward ?? false);
  }

  public static create(entry: INavigation = {
    instruction: '',
    fullStateInstruction: '',
  }): Navigation {
    return new Navigation(entry);
  }
}

