import { Constructable } from '@aurelia/kernel';
import { IController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, RouteableComponentType, NavigationInstruction, ViewportHandle } from './interfaces.js';
import { IRouter } from './router.js';
import { Viewport } from './viewport.js';
import { ViewportInstruction } from './viewport-instruction.js';
import { Scope } from './scope.js';
export declare const ComponentAppellationResolver: {
    isName(component: ComponentAppellation): component is string;
    isType(component: ComponentAppellation): component is RouteableComponentType<Constructable<{}>>;
    isInstance(component: ComponentAppellation): component is IRouteableComponent;
    getName(component: ComponentAppellation): string;
    getType(component: ComponentAppellation): RouteableComponentType | null;
    getInstance(component: ComponentAppellation): IRouteableComponent | null;
};
export declare const ViewportHandleResolver: {
    isName(viewport: ViewportHandle): viewport is string;
    isInstance(viewport: ViewportHandle): viewport is Viewport;
    getName(viewport: ViewportHandle): string | null;
    getInstance(viewport: ViewportHandle): Viewport | null;
};
export interface IViewportInstructionsOptions {
    context?: ICustomElementViewModel | Node | IController;
}
export declare const NavigationInstructionResolver: {
    createViewportInstructions(router: IRouter, navigationInstructions: NavigationInstruction | NavigationInstruction[], options?: IViewportInstructionsOptions | undefined): {
        instructions: string | ViewportInstruction[];
        scope: Scope | null;
    };
    toViewportInstructions(router: IRouter, navigationInstructions: NavigationInstruction | NavigationInstruction[]): ViewportInstruction[];
};
//# sourceMappingURL=type-resolvers.d.ts.map