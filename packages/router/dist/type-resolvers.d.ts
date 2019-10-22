import { Constructable } from '@aurelia/kernel';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, IViewportInstruction, NavigationInstruction, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare const ComponentAppellationResolver: {
    isName: (component: ComponentAppellation) => component is string;
    isType: (component: ComponentAppellation) => component is RouteableComponentType<Constructable<{}>>;
    isInstance: (component: ComponentAppellation) => component is IRouteableComponent<import("@aurelia/runtime").INode>;
    getName: (component: ComponentAppellation) => string;
    getType: (component: ComponentAppellation) => RouteableComponentType<Constructable<{}>> | null;
    getInstance: (component: ComponentAppellation) => IRouteableComponent<import("@aurelia/runtime").INode> | null;
};
export declare const ViewportHandleResolver: {
    isName: (viewport: ViewportHandle) => viewport is string;
    isInstance: (viewport: ViewportHandle) => viewport is Viewport;
    getName: (viewport: ViewportHandle) => string | null;
    getInstance: (viewport: ViewportHandle) => Viewport | null;
};
export declare const NavigationInstructionResolver: {
    toViewportInstructions: (router: IRouter, navigationInstructions: string | ViewportInstruction | Constructable<{}> | RouteableComponentType<Constructable<{}>> | IRouteableComponent<import("@aurelia/runtime").INode> | IViewportInstruction | NavigationInstruction[]) => ViewportInstruction[];
};
//# sourceMappingURL=type-resolvers.d.ts.map