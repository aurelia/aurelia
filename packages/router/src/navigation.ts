import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { RoutingScope } from './routing-scope.js';
import { OpenPromise } from './utilities/open-promise.js';

export interface IStoredNavigation extends Omit<StoredNavigation, 'toStoredNavigation'> { }

/**
 * The stored navigation holds the part of a navigation that's stored
 * in history. Note that the data might not be json serializable and
 * therefore might not be able to be stored as-is.
 */
export class StoredNavigation {
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
   * The fragment of the navigation
   */
   public fragment?: string;

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
    this.instruction = entry.instruction;
    this.fullStateInstruction = entry.fullStateInstruction;
    this.scope = entry.scope;
    this.index = entry.index;
    this.firstEntry = entry.firstEntry;
    // this.route = entry.route;
    this.path = entry.path;
    this.title = entry.title;
    this.query = entry.query;
    this.fragment = entry.fragment;
    this.parameters = entry.parameters;
    this.data = entry.data;
  }

  public toStoredNavigation(): IStoredNavigation {
    return {
      instruction: this.instruction,
      fullStateInstruction: this.fullStateInstruction,
      scope: this.scope,
      index: this.index,
      firstEntry: this.firstEntry,
      // route: this.route,
      path: this.path,
      title: this.title,
      query: this.query,
      fragment: this.fragment,
      parameters: this.parameters,
      data: this.data,
    };
  }
}

export class NavigationFlags {
  public first: boolean = false;
  public new: boolean = false;
  public refresh: boolean = false;
  public forward: boolean = false;
  public back: boolean = false;
  public replace: boolean = false;
}

export interface INavigation extends Partial<Omit<Navigation, 'instruction' | 'fullStateInstruction' | 'navigation' | 'toStoredNavigation' | 'useFullStateInstruction' | 'process' | 'timestamp'>> {
  instruction: string | RoutingInstruction[];
  fullStateInstruction: string | RoutingInstruction[];
}

/**
 * The navigation
 */

export class Navigation extends StoredNavigation {
  /**
   * The navigation in a historical context (back, forward, etc)
   */
  public navigation: NavigationFlags = new NavigationFlags();

  /**
   * Whether this is a repeating navigation, in other words the same navigation run again
   */
  public repeating: boolean = false;

  /**
   * The previous navigation
   */
  public previous: Navigation | null = null;

  /**
   * Whether the navigation originates from a browser action (back, forward)
   */
  public fromBrowser: boolean = false;

  /**
   * The origin of the navigation, a view model or element
   */
  public origin: ICustomElementViewModel | Element | null = null;

  /**
   * Whether this navigation is fully replacing a previous one
   */
  public replacing: boolean = false;

  /**
   * Whether this navigation is a refresh/reload with the same parameters
   */
  public refreshing: boolean = false;

  /**
   * Whether this navigation is untracked and shouldn't be added to history
   */
  public untracked: boolean = false;

  /**
   * How the navigation has moved in history compared to previous navigation
   */
  public historyMovement?: number;

  /**
   * The process of the navigation, to be resolved or rejected
   */
  public process: OpenPromise<boolean> | null = null;

  /**
   * When the navigation is created. Only used within session so no need to
   * persist it.
   */
  public timestamp: number;

  /**
   * Whether the navigation is completed
   */
  public completed?: boolean = true;

  public constructor(entry: INavigation | Navigation = {
    instruction: '',
    fullStateInstruction: '',
  }) {
    super(entry);

    this.fromBrowser = entry.fromBrowser ?? this.fromBrowser;
    this.origin = entry.origin ?? this.origin;
    this.replacing = entry.replacing ?? this.replacing;
    this.refreshing = entry.refreshing ?? this.refreshing;
    this.untracked = entry.untracked ?? this.untracked;
    this.historyMovement = entry.historyMovement ?? this.historyMovement;
    this.process = null;

    this.timestamp = Date.now();
  }

  public get useFullStateInstruction(): boolean {
    return (this.navigation.back ?? false) ||
      (this.navigation.forward ?? false) ||
      (this.navigation.refresh ?? false);
  }

  public static create(entry: INavigation = {
    instruction: '',
    fullStateInstruction: '',
  }): Navigation {
    return new Navigation(entry);
  }
}

