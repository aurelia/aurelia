import { type ICustomElementViewModel } from '@aurelia/runtime-html';
import { NavigationInstruction, Params } from './instructions';
import type { IRouteConfig } from './options';
import type { RouteNode } from './route-tree';
export interface IRouteViewModel extends ICustomElementViewModel {
    getRouteConfig?(parentConfig: IRouteConfig | null, routeNode: RouteNode | null): IRouteConfig | Promise<IRouteConfig>;
    canLoad?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    loading?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
    canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
    unloading?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}
//# sourceMappingURL=component-agent.d.ts.map