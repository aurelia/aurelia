import { Constructable } from '@aurelia/kernel';
import { ComponentAppellation, IRouteableComponent, IRouteableComponentType, IViewportInstruction, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare const ComponentAppellationResolver: {
    isName: <T>(component: (T & string) | (T & Constructable<{}>) | (T & IRouteableComponentType<Constructable<{}>>) | (T & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T & string) | (T & Constructable<{}> & string) | (T & IRouteableComponentType<Constructable<{}>> & string) | (T & IRouteableComponent<import("@aurelia/runtime").INode> & string);
    isType: <T_1>(component: (T_1 & string) | (T_1 & Constructable<{}>) | (T_1 & IRouteableComponentType<Constructable<{}>>) | (T_1 & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T_1 & IRouteableComponentType<Constructable<{}>>) | (T_1 & string & IRouteableComponentType<Constructable<{}>>) | (T_1 & Constructable<{}> & IRouteableComponentType<Constructable<{}>>) | (T_1 & IRouteableComponent<import("@aurelia/runtime").INode> & IRouteableComponentType<Constructable<{}>>);
    isInstance: <T_2>(component: (T_2 & string) | (T_2 & Constructable<{}>) | (T_2 & IRouteableComponentType<Constructable<{}>>) | (T_2 & IRouteableComponent<import("@aurelia/runtime").INode>)) => component is (T_2 & IRouteableComponent<import("@aurelia/runtime").INode>) | (T_2 & string & IRouteableComponent<import("@aurelia/runtime").INode>) | (T_2 & Constructable<{}> & IRouteableComponent<import("@aurelia/runtime").INode>) | (T_2 & IRouteableComponentType<Constructable<{}>> & IRouteableComponent<import("@aurelia/runtime").INode>);
    getName: (component: ComponentAppellation) => string;
    getType: (component: ComponentAppellation) => IRouteableComponentType<Constructable<{}>> | null;
    getInstance: (component: ComponentAppellation) => IRouteableComponent<import("@aurelia/runtime").INode> | null;
};
export declare const ViewportHandleResolver: {
    isName: <T>(viewport: (T & string) | (T & Viewport)) => viewport is (T & string) | (T & Viewport);
    isInstance: <T_1>(viewport: (T_1 & string) | (T_1 & Viewport)) => viewport is (T_1 & string) | (T_1 & Viewport);
    getName: <T_2>(viewport: (T_2 & string) | (T_2 & Viewport)) => string | null;
    getInstance: <T_3>(viewport: (T_3 & string) | (T_3 & Viewport)) => Viewport | null;
};
export declare const NavigationInstructionResolver: {
    toViewportInstructions: (router: IRouter, navigationInstructions: string | ViewportInstruction | Constructable<{}> | IRouteableComponentType<Constructable<{}>> | IRouteableComponent<import("@aurelia/runtime").INode> | IViewportInstruction | NavigationInstruction[]) => ViewportInstruction[];
};
//# sourceMappingURL=type-resolvers.d.ts.map