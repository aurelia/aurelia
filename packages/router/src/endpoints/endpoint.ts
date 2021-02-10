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
// import { EndpointContent } from './endpoint-content';
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
  EndpointContent,
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

  setActive?: (active: boolean) => void;
}

export interface IEndpointOptions {
  noHistory?: boolean;
}

export type EndpointType = 'Viewport' | 'ViewportScope';

export interface IEndpoint extends Endpoint { }

export class Endpoint {
  public content!: EndpointContent;
  public nextContent: EndpointContent | null = null;

  public nextContentAction: NextContentAction = '';

  public path: string | null = null;

  public constructor(
    public readonly router: IRouter,
    public name: string,
    public connectedCE: IConnectedCustomElement | null,
    owningScope: RoutingScope | null,
    scope: boolean,
    public options: IEndpointOptions = {}
  ) { }

  public get activeContent(): EndpointContent {
    return this.nextContent ?? this.content;
  }

  public get connectedScope(): RoutingScope {
    return this.activeContent?.connectedScope;
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
  // public get enabled(): boolean {
  //   return this.connectedScope.enabled;
  // }
  // public set enabled(enabled: boolean) {
  //   this.connectedScope.enabled = enabled;
  // }

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

  public setNextContent(_instruction: RoutingInstruction, _navigation: Navigation): NextContentAction {
    throw new Error(`Method 'setNextContent' needs to be implemented in all endpoints!`);
  }

  public setConnectedCE(_connectedCE: IConnectedCustomElement, _options: IViewportOptions | IViewportScopeOptions): void {
    throw new Error(`Method 'setConnectedCE' needs to be implemented in all endpoints!`);
  }

  public transition(_coordinator: NavigationCoordinator): void {
    throw new Error(`Method 'transition' needs to be implemented in all endpoints!`);
  }

  public finalizeContentChange(): void {
    throw new Error(`Method 'finalizeContentChange' needs to be implemented in all endpoints!`);
  }

  public abortContentChange(_step: Step<void> | null): void | Step<void> {
    throw new Error(`Method 'abortContentChange' needs to be implemented in all endpoints!`);
  }

  public getRoutes(): Route[] | null {
    throw new Error(`Method 'getRoutes' needs to be implemented in all endpoints!`);
  }

  public removeEndpoint(_step: Step | null, _connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    this.content.delete();
    this.nextContent?.delete();
    return true;
  }

  public canUnload(_step: Step<boolean> | null): boolean | Promise<boolean> {
    return true;
  }
  public canLoad(_step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    return true;
  }

  public unload(_step: Step<void> | null/*, recurse: boolean, transitionId: number*/): void | Step<void> {
    return;
  }
  public load(_step: Step<void>): Step<void> | void {
    return;
  }
}
