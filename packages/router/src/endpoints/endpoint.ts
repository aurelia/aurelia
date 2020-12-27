import { IViewportScopeOptions } from './../viewport-scope';
import { IContainer } from '@aurelia/kernel';
import { ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
// import { LoadInstruction } from '../interfaces.js';
// import { IRouter } from '../router.js';
// import { NextContentAction, Scope } from '../scope.js';
// import { IRoutingController, IConnectedCustomElement } from '../resources/viewport.js';
// import { Step } from '../runner.js';
// import { Route } from '../route.js';
// import { RoutingInstruction } from '../instructions/routing-instruction.js';
// import { Navigation } from '../navigation.js';
// import { NavigationCoordinator } from '../navigation-coordinator.js';
import {
  LoadInstruction,
  IRouter,
  NextContentAction,
  RoutingScope,
  Step,
  Route,
  RoutingInstruction,
  Navigation,
  NavigationCoordinator,
  IViewportOptions,
} from '../index.js';

/**
 * An endpoint is anything that can receive and process a routing instruction.
 */

export interface IRoutingController extends ICustomElementController {
  routingContainer?: IContainer;
}
export interface IConnectedCustomElement extends ICustomElementViewModel {
  element: HTMLElement;
  container: IContainer;
  controller: IRoutingController;
}

export interface IEndpointOptions {
  noHistory?: boolean;
}

export type EndpointType = 'Viewport' | 'ViewportScope';

export interface IEndpoint extends Endpoint { }

export class Endpoint {
  public connectedScope: RoutingScope;
  public nextContentAction: NextContentAction = '';

  public path: string | null = null;

  public constructor(
    public readonly router: IRouter,
    public name: string,
    public connectedCE: IConnectedCustomElement | null,
    owningScope: RoutingScope | null,
    scope: boolean,
    public options: IEndpointOptions = {}
  ) {
    this.connectedScope = new RoutingScope(router, scope, owningScope, this);
  }

  public get scope(): RoutingScope {
    return this.connectedScope.scope;
  }
  public get owningScope(): RoutingScope {
    return this.connectedScope.owningScope!;
  }

  public get connectedController(): IRoutingController | null {
    return this.connectedCE?.$controller ?? null;
  }
  public get enabled(): boolean {
    return this.connectedScope.enabled;
  }
  public set enabled(enabled: boolean) {
    this.connectedScope.enabled = enabled;
  }

  public get isViewport(): boolean {
    return false;
  }
  public get isViewportScope(): boolean {
    return false;
  }
  public get isEmpty(): boolean {
    return false;
  }

  // public get parentNextContentActivated(): boolean {
  //   return this.scope.parent?.endpoint?.nextContentActivated ?? false;
  // }

  public get pathname(): string {
    return this.connectedScope.pathname;
  }

  public toString(): string {
    throw new Error(`Method 'toString' needs to be implemented in all endpoints!`);
  }

  public setNextContent(routingInstruction: RoutingInstruction, navigation: Navigation): NextContentAction {
    throw new Error(`Method 'setNextContent' needs to be implemented in all endpoints!`);
  }

  public setConnectedCE(connectedCE: IConnectedCustomElement, options: IViewportOptions | IViewportScopeOptions): void {
    throw new Error(`Method 'setConnectedCE' needs to be implemented in all endpoints!`);
  }

  public transition(coordinator: NavigationCoordinator): void {
    throw new Error(`Method 'transition' needs to be implemented in all endpoints!`);
  }

  public finalizeContentChange(): void {
    throw new Error(`Method 'finalizeContentChange' needs to be implemented in all endpoints!`);
  }

  public abortContentChange(step: Step<void> | null): void | Step<void> {
    throw new Error(`Method 'abortContentChange' needs to be implemented in all endpoints!`);
  }

  public getRoutes(): Route[] | null {
    throw new Error(`Method 'getRoutes' needs to be implemented in all endpoints!`);
  }

  public removeEndpoint(step: Step | null, connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    return true;
  }

  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    return true;
  }
  public canLoad(step: Step<boolean>, recurse: boolean): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    return true;
  }

  public unload(step: Step<void> | null, recurse: boolean): void | Step<void> {
    return;
  }
  public load(step: Step<void>, recurse: boolean): Step<void> | void {
    return;
  }
}
