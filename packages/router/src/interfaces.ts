import { DI, Constructable, PLATFORM } from '@aurelia/kernel';
import { CustomElementType, ICustomElementViewModel } from '@aurelia/runtime';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { HTMLDOM } from '@aurelia/runtime-html';
import { INavigatorFlags } from './router';
import { Scope } from './scope';
import { stringifyViewportInstructions } from './instruction-resolver';

export const IWindow = DI.createInterface<IWindow>('IWindow').withDefault(x => x.callback(handler => handler.get(HTMLDOM).window));
export interface IWindow extends Window { }

export const ILocation = DI.createInterface<ILocation>('ILocation').withDefault(x => x.callback(handler => handler.get(IWindow).location));
export interface ILocation extends Location { }

export const IHistory = DI.createInterface<IHistory>('IHistory').withDefault(x => x.callback(handler => handler.get(IWindow).history));
// NOTE: `IHistory` is documented
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/History
 *
 * A convenience interface that (unless explicitly overridden in DI) resolves directly to the native browser `history` object.
 *
 * Allows manipulation of the browser session history, that is the pages visited in the tab or frame that the current page is loaded in.
 */
export interface IHistory extends History {
  /**
   * Returns an integer representing the number of elements in the session history, including the currently loaded page.
   * For example, for a page loaded in a new tab this property returns 1.
   */
  readonly length: number;
  /**
   * Allows web applications to explicitly set default scroll restoration behavior on history navigation.
   *
   * - `auto` The location on the page to which the user has scrolled will be restored.
   * - `manual` The location on the page is not restored. The user will have to scroll to the location manually.
   */
  scrollRestoration: ScrollRestoration;
  /**
   * Returns a value representing the state at the top of the history stack.
   * This is a way to look at the state without having to wait for a popstate event
   */
  readonly state: unknown;
  /**
   * Causes the browser to move back one page in the session history.
   * It has the same effect as calling history.go(-1).
   * If there is no previous page, this method call does nothing.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   */
  back(): void;
  /**
   * Causes the browser to move forward one page in the session history.
   * It has the same effect as calling `history.go(1)`.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   */
  forward(): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/go
   *
   * Loads a specific page from the session history.
   * You can use it to move forwards and backwards through the history depending on the value of a parameter.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page.
   * A negative value moves backwards, a positive value moves forwards.
   * So, for example, `history.go(2)` moves forward two pages and `history.go(-2)` moves back two pages.
   * If no value is passed or if `delta` equals 0, it has the same result as calling `location.reload()`.
   */
  go(delta?: number): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
   *
   * Adds a state to the browser's session history stack.
   *
   * @param state - An object which is associated with the new history entry created by `pushState`.
   * Whenever the user navigates to the new state, a `popstate` event is fired, and the state property of the event contains a copy of the history entry's state object.
   * The state object can be anything that can be serialized.
   * @param title - Most browsers currently ignores this parameter, although they may use it in the future.
   * Passing the empty string here should be safe against future changes to the method.
   * Alternatively, you could pass a short title for the state.
   * @param url - The new history entry's URL is given by this parameter.
   * Note that the browser won't attempt to load this URL after a call to pushState(), but it might attempt to load the URL later, for instance after the user restarts the browser.
   * The new URL does not need to be absolute; if it's relative, it's resolved relative to the current URL.
   * The new URL must be of the same origin as the current URL; otherwise, pushState() will throw an exception.
   * If this parameter isn't specified, it's set to the document's current URL.
   */
  pushState(state: {} | null, title: string, url?: string | null): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
   *
   * Modifies the current history entry, replacing it with the stateObj, title, and URL passed in the method parameters.
   *
   * This method is particularly useful when you want to update the state object or URL of the current history entry in response to some user action.
   *
   * @param state - An object which is associated with the history entry passed to the `replaceState` method.
   * @param title - Most browsers currently ignores this parameter, although they may use it in the future.
   * Passing the empty string here should be safe against future changes to the method.
   * Alternatively, you could pass a short title for the state.
   * @param url - The URL of the history entry.
   * The new URL must be of the same origin as the current URL; otherwise `replaceState` throws an exception.
   */
  replaceState(state: {} | null, title: string, url?: string | null): void;
}

/*
* Contains interfaces and types that aren't strongly connected
* to component(s) or that are considered an essential part
* of the API.
*/

export type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
  parameters?: string[];
};

export interface IRouteableComponent extends ICustomElementViewModel<Element> {
  reentryBehavior?: ReentryBehavior;
  canEnter?(
    parameters: Record<string, unknown>,
    nextInstruction: NavigatorInstruction,
    instruction: NavigatorInstruction,
  ): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
  enter?(
    parameters: Record<string, unknown>,
    nextInstruction: NavigatorInstruction,
    instruction: NavigatorInstruction,
  ): void | Promise<void>;
  canLeave?(
    nextInstruction: NavigatorInstruction | null,
    instruction: NavigatorInstruction,
  ): boolean | Promise<boolean>;
  leave?(
    nextInstruction: NavigatorInstruction | null,
    instruction: NavigatorInstruction,
  ): void | Promise<void>;
}

export const enum ReentryBehavior {
  default = 'default',
  disallow = 'disallow',
  enter = 'enter',
  refresh = 'refresh',
}

function ensureString(instruction: string | ViewportInstruction[]): string {
  if (typeof instruction === 'string') {
    return instruction;
  }
  return stringifyViewportInstructions(instruction);
}

export class NavigatorEntrySnapshot {
  public get isSnapshot(): true { return true; }
  public get hasInstructions(): false { return false; }

  private constructor(
    public readonly id: number,
    public readonly version: number,
    public readonly instruction: string,
    public readonly fullStateInstruction: string,
    public readonly index: number,
    public readonly path: string,
    public readonly title: string,
    public readonly query: string,
    public readonly parameters: Readonly<Record<string, string>>,
    public readonly data: Record<string, unknown>,
  ) { }

  public static create(
    entry: Omit<NavigatorEntry, 'isSnapshot'>,
  ): NavigatorEntrySnapshot {
    const snapshot = new NavigatorEntrySnapshot(
      entry.id,
      entry.version,
      ensureString(entry.instruction),
      ensureString(entry.fullStateInstruction),
      entry.index,
      entry.path,
      entry.title,
      entry.query,
      Object.freeze(JSON.parse(JSON.stringify(entry.parameters))),
      entry.data,
    );

    Object.freeze(snapshot);
    return snapshot;
  }

  public toEntry(): NavigatorEntry {
    return NavigatorEntry.create(this);
  }

  public toInstruction(): NavigatorInstruction {
    return this.toEntry().toInstruction();
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

export class NavigatorEntry {
  public get isSnapshot(): false { return false; }

  public get instructions(): readonly ViewportInstruction[] {
    return typeof this.instruction === 'string'
      ? PLATFORM.emptyArray
      : this.instruction;
  }
  public get fullStateInstructions(): readonly ViewportInstruction[] {
    return typeof this.fullStateInstruction === 'string'
      ? PLATFORM.emptyArray
      : this.fullStateInstruction;
  }
  public get hasInstructions(): boolean {
    return typeof this.instruction !== 'string' || typeof this.fullStateInstruction !== 'string';
  }

  protected constructor(
    public readonly id: number,
    public readonly version: number,
    public instruction: string | ViewportInstruction[],
    public fullStateInstruction: string | ViewportInstruction[],
    public index: number,
    public path: string,
    public readonly title: string,
    public readonly query: string,
    public parameters: Readonly<Record<string, unknown>>,
    public readonly data: Record<string, unknown>,
  ) {}

  public static create(
    input: Omit<NavigatorEntrySnapshot | NavigatorEntry, 'hasInstructions' | 'fullStateInstructions' | 'instructions' | 'isSnapshot'>,
  ): NavigatorEntry {
    return new NavigatorEntry(
      input.id,
      input.version,
      input.instruction,
      input.fullStateInstruction,
      input.index,
      input.path,
      input.title,
      input.query,
      Object.freeze(JSON.parse(JSON.stringify(input.parameters))),
      input.data,
    );
  }

  /**
   * Turns this entry into an immutable snapshot, suitable for serialization*:
   * - Non-string instructions are stringified
   * - Parameters are frozen
   * - The entry itself is frozen
   *
   * (*) user data object is not touched and could either be non-serializable and/or mutable,
   * that is ultimately the responsibility of the user.
   */
  public toSnapshot(): NavigatorEntrySnapshot {
    return NavigatorEntrySnapshot.create(this);
  }

  /**
   * Clones this entry, retaining only the properties `NavigatorEntry` and
   * omitting any properties from subtypes.
   */
  public toEntry(): NavigatorEntry {
    return NavigatorEntry.create(this);
  }

  public toInstruction(): NavigatorInstruction {
    return NavigatorInstruction.create(this);
  }

  public toString(): string {
    return JSON.stringify(this.toSnapshot());
  }
}

let instructionId: number = 0;

export class NavigatorInstruction extends NavigatorEntry {
  public static readonly INITIAL: NavigatorInstruction = Object.freeze(NavigatorInstruction.create()) as NavigatorInstruction;

  public get isInitial(): boolean {
    return this === NavigatorInstruction.INITIAL;
  }

  public get promise(): Promise<void> {
    if (this._promise === null) {
      this._promise = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
    }
    return this._promise;
  }
  private _promise: Promise<void> | null = null;
  private _resolve: (() => void) | null = null;
  private _reject: ((err: unknown) => void) | null = null;

  protected constructor(
    id: number,
    version: number,
    instruction: string | ViewportInstruction[],
    fullStateInstruction: string | ViewportInstruction[],
    index: number,
    path: string,
    title: string,
    query: string,
    parameters: Readonly<Record<string, unknown>>,
    data: Record<string, unknown>,
    public route: IRoute | null,
    public scope: Scope | null,
    public fromBrowser: boolean,
    public replacing: boolean,
    public refreshing: boolean,
    public repeating: boolean,
    public untracked: boolean,
    public historyMovement: number,
    public navigation: INavigatorFlags,
    public previous: NavigatorEntry | null,
  ) {
    super(
      id,
      version,
      instruction,
      fullStateInstruction,
      index,
      path,
      title,
      query,
      parameters,
      data,
    );
  }

  public static create(
    input: Partial<Omit<NavigatorInstruction, 'hasInstructions' | 'fullStateInstructions' | 'instructions' | 'promise' | 'isInitial' | 'isSnapshot'>> = {},
  ): NavigatorInstruction {
    return new NavigatorInstruction(
      input.id ?? ++instructionId,
      (input.version ?? 0) + 1,
      input.instruction ?? '',
      input.fullStateInstruction ?? '',
      input.index ?? -1,
      input.path ?? '',
      input.title ?? '',
      input.query ?? '',
      input.parameters ?? {},
      input.data ?? {},
      input.route ?? null,
      input.scope ?? null,
      input.fromBrowser ?? false,
      input.replacing ?? false,
      input.refreshing ?? false,
      input.repeating ?? false,
      input.untracked ?? false,
      input.historyMovement ?? 0,
      input.navigation ?? {},
      input.previous ?? null,
    );
  }

  public toInstruction(): NavigatorInstruction {
    return this;
  }

  public resolve(): void {
    const resolve = this._resolve;
    if (resolve === null) {
      if (this._promise === null) {
        throw new Error(`NavigatorInstruction.resolve called before promise was initialized: ${this.toString()}`);
      }
      throw new Error(`NavigatorInstruction.resolve called more than once on the same instruction: ${this.toString()}`);
    }
    this._resolve = this._reject = null;
    resolve();
  }

  public reject(err: unknown): void {
    const reject = this._reject;
    if (reject === null) {
      if (this._promise === null) {
        throw new Error(`NavigatorInstruction.reject called before promise was initialized: ${this.toString()}`);
      }
      throw new Error(`NavigatorInstruction.reject called more than once on the same instruction: ${this.toString()}`);
    }
    this._resolve = this._reject = null;
    reject(err);
  }
}

export interface IViewportInstruction {
  component: ComponentAppellation;
  viewport?: ViewportHandle;
  parameters?: ComponentParameters;
  children?: NavigationInstruction[];
}

export interface IRoute {
  path: string;
  id?: string;
  instructions: NavigationInstruction[] | ViewportInstruction[];
}

export interface IComponentAndOrViewportOrNothing {
  component?: ComponentAppellation;
  viewport?: ViewportHandle;
}

export type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;

export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;
export type ViewportHandle = string | Viewport;
export type ComponentParameters = string | Record<string, unknown> | unknown[];
