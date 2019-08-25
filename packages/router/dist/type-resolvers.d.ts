import { ComponentAppellation, IRouteableComponent, IRouteableComponentType, IViewportInstruction, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare const ComponentAppellationResolver: {
    isName: <T>(component: (T & string) | (T & import("@aurelia/kernel").Constructable<{}>) | (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T & string) | (T & import("@aurelia/kernel").Constructable<{}> & string) | (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>> & string) | (T & IRouteableComponent<import("@aurelia/runtime").INode> & string);
    isType: <T>(component: (T & string) | (T & import("@aurelia/kernel").Constructable<{}>) | (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & string & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & import("@aurelia/kernel").Constructable<{}> & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & IRouteableComponent<import("@aurelia/runtime").INode> & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>);
    isInstance: <T>(component: (T & string) | (T & import("@aurelia/kernel").Constructable<{}>) | (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>>) | (T & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T & IRouteableComponent<import("@aurelia/runtime").INode>) | (T & string & IRouteableComponent<import("@aurelia/runtime").INode>) | (T & import("@aurelia/kernel").Constructable<{}> & IRouteableComponent<import("@aurelia/runtime").INode>) | (T & IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>> & IRouteableComponent<import("@aurelia/runtime").INode>);
    getName: (component: ComponentAppellation) => string;
    getType: (component: ComponentAppellation) => IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>> | null;
    getInstance: (component: ComponentAppellation) => IRouteableComponent<import("@aurelia/runtime").INode> | null;
};
export declare const ViewportHandleResolver: {
    isName: <T>(viewport: (T & string) | (T & Viewport)) => viewport is (T & string) | (T & Viewport);
    isInstance: <T>(viewport: (T & string) | (T & Viewport)) => viewport is (T & string) | (T & Viewport);
    getName: <T>(viewport: (T & string) | (T & Viewport)) => string | null;
    getInstance: <T>(viewport: (T & string) | (T & Viewport)) => Viewport | null;
};
export declare const NavigationInstructionResolver: {
    toViewportInstructions: (router: IRouter, navigationInstructions: string | import("@aurelia/kernel").Constructable<{}> | ViewportInstruction | IRouteableComponentType<import("@aurelia/kernel").Constructable<{}>> | IRouteableComponent<import("@aurelia/runtime").INode> | IViewportInstruction | NavigationInstruction[]) => ViewportInstruction[];
};
//# sourceMappingURL=type-resolvers.d.ts.map