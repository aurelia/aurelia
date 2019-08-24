import { Constructable } from '@aurelia/kernel';
import { IRouteableComponent, IRouteableComponentType, IViewportInstruction, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare const ComponentAppellationResolver: {
    isName: <T>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => component is (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>);
    isType: <T>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => component is (T & IRouteableComponentType<Constructable<{}>>) | (T & string & IRouteableComponentType<Constructable<{}>>) | (T & Constructable<{}> & IRouteableComponentType<Constructable<{}>>);
    isInstance: <T>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => component is (T & string & IRouteableComponent<import("@aurelia/runtime").INode>) | (T & Constructable<{}> & IRouteableComponent<import("@aurelia/runtime").INode>) | (T & IRouteableComponentType<Constructable<{}>> & IRouteableComponent<import("@aurelia/runtime").INode>);
    getName: <T>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => string;
    getType: <T extends Constructable<{}>>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => IRouteableComponentType<Constructable<{}>>;
    getInstance: <T extends Constructable<{}>>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>)) => IRouteableComponent<import("@aurelia/runtime").INode>;
};
export declare const ViewportHandleResolver: {
    isName: <T>(viewport: (T & string) | (T & Viewport)) => viewport is (T & string) | (T & Viewport);
    isInstance: <T>(viewport: (T & string) | (T & Viewport)) => viewport is (T & string) | (T & Viewport);
    getName: <T>(viewport: (T & string) | (T & Viewport)) => string;
    getInstance: <T>(viewport: (T & string) | (T & Viewport)) => Viewport;
};
export declare const NavigationInstructionResolver: {
    toViewportInstructions: (router: IRouter, navigationInstructions: string | Constructable<{}> | ViewportInstruction | IRouteableComponentType<Constructable<{}>> | IViewportInstruction | NavigationInstruction[]) => ViewportInstruction[];
};
//# sourceMappingURL=type-resolvers.d.ts.map