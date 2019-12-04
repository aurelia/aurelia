import { CustomElementType } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, IRoute, RouteableComponentType } from './interfaces';
import { FoundRoute } from './found-route';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { NavigationInstructionResolver } from './type-resolvers';
import { Viewport, IViewportOptions } from './viewport';
import { IScopeOwner, Scope } from './scope';

export interface IViewportScopeOptions {
  catches?: string | string[];
  source?: unknown[] | null;
}

export class ViewportScope implements IScopeOwner {
  public connectedScope: Scope;

  public path: string | null = null;

  public content: ViewportInstruction | null = null;

  public available: boolean = true;

  public constructor(
    public name: string,
    public readonly router: IRouter,
    public element: Element | null,
    owningScope: Scope | null,
    scope: boolean,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
    public options: IViewportScopeOptions = {
      catches: [],
      source: null,
    },
  ) {
    this.connectedScope = new Scope(router, scope, owningScope, null, this);
    let catches: string | string[] = this.options.catches || [];
    if (typeof catches === 'string') {
      catches = catches.split(',');
    }
    if (catches.length > 0) {
      this.content = router.createViewportInstruction(catches[0]);
    }
  }

  public get scope(): Scope {
    return this.connectedScope.scope!;
  }
  public get owningScope(): Scope {
    return this.connectedScope.owningScope!;
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
    return true;
  }

  public get passThroughScope(): boolean {
    return this.rootComponentType === null && (this.options.catches === void 0 || this.options.catches.length === 0);
  }

  public setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: INavigatorInstruction): boolean {
    this.content = content as ViewportInstruction;
    return true;
  }
  public acceptSegment(segment: string): boolean {
    if (segment === null && segment === void 0 || segment.length === 0) {
      return true;
    }
    let catches = this.options.catches || [];
    if (typeof catches === 'string') {
      catches = catches.split(',');
    }
    if (catches.length === 0) {
      return true;
    }

    if (catches.includes(segment as string)) {
      return true;
    }
    if (catches.filter((value) => value.includes('*')).length) {
      return true;
    }
    return false;
  }

  public getRoutes(): IRoute[] | null {
    if (this.rootComponentType !== null) {
      return (this.rootComponentType as RouteableComponentType & { routes: IRoute[] }).routes;
    }
    return null;
  }

  public canLeave(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
