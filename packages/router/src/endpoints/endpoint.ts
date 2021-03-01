import { IContainer } from '@aurelia/kernel';
import { ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import {
  LoadInstruction,
  IRouter,
  TransitionAction,
  RoutingScope,
  Step,
  Route,
  RoutingInstruction,
  Navigation,
  NavigationCoordinator,
  IViewportOptions,
  IViewportScopeOptions,
  EndpointContent,
  Viewport,
  ViewportScope,
} from '../index.js';

/**
 * An endpoint is anything that can receive and process a routing instruction.
 */

/**
 * Additional properties for endpoint custom elements.
 */
export interface IConnectedCustomElement extends ICustomElementViewModel {
  element: HTMLElement;
  container: IContainer;
  controller: ICustomElementController;

  setActive?: (active: boolean) => void;
}

export interface IEndpointOptions {
  /**
   * The transitions in the endpoint shouldn't be added to the navigation history
   */
  noHistory?: boolean;
}

export type EndpointType = Viewport | ViewportScope;
export type EndpointTypeName = 'Viewport' | 'ViewportScope';

export interface IEndpoint extends Endpoint { }

export class Endpoint {
  /**
   * The contents of the endpoint. New contents are pushed to this, making
   * the last one the active one.
   */
  public contents: EndpointContent[] = [];

  // /**
  //  * The current content of the endpoint
  //  */
  // public content!: EndpointContent;
  // /**
  //  * The next, to be transitioned in, content of the endpoint
  //  */
  // public nextContent: EndpointContent | null = null;

  /**
   * The action (to be) performed by the transition
   */
  public transitionAction: TransitionAction = '';

  /**
   * The configured route path to this endpoint
   */
  public path: string | null = null;

  public constructor(
    public readonly router: IRouter,
    /**
     * The endpoint name
     */
    public name: string,
    /**
     * The custom element connected to this endpoint
     */
    public connectedCE: IConnectedCustomElement | null,
    public options: IEndpointOptions = {}
  ) { }

  /**
   * The current content of the endpoint
   */
  public getContent(): EndpointContent {
    return this.contents[0];
  }

  /**
   * The next, to be transitioned in, content of the endpoint
   */
  public getNextContent(): EndpointContent | null {
    return this.contents.length > 1 ? this.contents[this.contents.length - 1] : null;
  }

  /**
   * The content of the endpoint from a specific time (index)
   */
  public getTimeContent(_index: number = Infinity): EndpointContent | null {
    return this.getContent();
  }

  /**
   * The active content, next or current.
   */
  public get activeContent(): EndpointContent {
    return this.getNextContent() ?? this.getContent();
  }

  /**
   * The routing scope that's currently, based on content, connected
   * to the endpoint. This is always the actually connected scope.
   */
  public get connectedScope(): RoutingScope {
    return this.activeContent?.connectedScope;
  }

  /**
   * The current, based on content, routing scope for the endpoint.
   * The scope used when finding next scope endpoints and configured routes.
   */
  public get scope(): RoutingScope {
    return this.connectedScope.scope;
  }

  /**
   * The routing scope that currently, based on content, owns the viewport.
   */
  public get owningScope(): RoutingScope {
    return this.connectedScope.owningScope!;
  }

  /**
   * The connected custom element's controller.
   */
  public get connectedController(): ICustomElementController | null {
    return this.connectedCE?.$controller ?? null;
  }

  /**
   * Whether the endpoint is a Viewport.
   */
  public get isViewport(): boolean {
    return this instanceof Viewport;
  }
  /**
   * Whether the endpoint is a ViewportScope.
   */
  public get isViewportScope(): boolean {
    return this instanceof ViewportScope;
  }

  /**
   * Whether the endpoint is empty. Overloaded with proper check
   * by Viewport and ViewportScope.
   */
  public get isEmpty(): boolean {
    return false;
  }

  /**
   * For debug purposes.
   */
  public get pathname(): string {
    return this.connectedScope.pathname;
  }

  /**
   * For debug purposes.
   */
  public toString(): string {
    throw new Error(`Method 'toString' needs to be implemented in all endpoints!`);
  }

  /**
   * Set the next content for the endpoint. Returns the action that the endpoint
   * will take when the navigation coordinator starts the transition.
   *
   * @param _instruction - The routing instruction describing the next content
   * @param _navigation - The navigation that requests the content change
   */
  public setNextContent(_instruction: RoutingInstruction, _navigation: Navigation): TransitionAction {
    throw new Error(`Method 'setNextContent' needs to be implemented in all endpoints!`);
  }

  /**
   * Connect an endpoint CustomElement to this endpoint, applying options
   * while doing so.
   *
   * @param _connectedCE - The custom element to connect
   * @param _options - The options to apply
   */
  public setConnectedCE(_connectedCE: IConnectedCustomElement, _options: IViewportOptions | IViewportScopeOptions): void {
    throw new Error(`Method 'setConnectedCE' needs to be implemented in all endpoints!`);
  }

  /**
   * Transition from current content to the next.
   *
   * @param _coordinator - The coordinator of the navigation
   */
  public transition(_coordinator: NavigationCoordinator): void {
    throw new Error(`Method 'transition' needs to be implemented in all endpoints!`);
  }

  /**
   * Finalize the change of content by making the next content the current
   * content. The previously current content is deleted.
   */
  public finalizeContentChange(_coordinator: NavigationCoordinator): void {
    throw new Error(`Method 'finalizeContentChange' needs to be implemented in all endpoints!`);
  }

  /**
   * Abort the change of content. The next content is freed/discarded.
   *
   * @param _step - The previous step in this transition Run
   */
  public cancelContentChange(_coordinator: NavigationCoordinator, _step: Step<void> | null): void | Step<void> {
    throw new Error(`Method 'cancelContentChange' needs to be implemented in all endpoints!`);
  }

  /**
   * Get any configured routes in the relevant content's component type.
   */
  public getRoutes(): Route[] | null {
    throw new Error(`Method 'getRoutes' needs to be implemented in all endpoints!`);
  }

  /**
   * Get the title for the content.
   *
   * @param navigation - The navigation that requests the content change
   */
  public getTitle(_navigation: Navigation): string {
    throw new Error(`Method 'getTitle' needs to be implemented in all endpoints!`);
  }

  /**
   * Remove the endpoint, deleting its contents.
   *
   * @param _step - The previous step in this transition Run
   * @param _connectedCE - The custom element that's being removed
   */
  public removeEndpoint(_step: Step | null, _connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    this.getContent().delete();
    this.getNextContent()?.delete();
    return true;
  }

  /**
   * Check if the next content can be unloaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canUnload(_step: Step<boolean> | null): boolean | Promise<boolean> {
    return true;
  }
  /**
   * Check if the next content can be loaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canLoad(_step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    return true;
  }

  /**
   * Unload the next content.
   *
   * @param step - The previous step in this transition Run
   */
  public unload(_step: Step<void> | null): void | Step<void> {
    return;
  }
  /**
   * Load the next content.
   *
   * @param step - The previous step in this transition Run
   */
  public load(_step: Step<void>): Step<void> | void {
    return;
  }
}
