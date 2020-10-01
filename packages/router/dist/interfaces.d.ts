import { Constructable } from '@aurelia/kernel';
import { CustomElementType, INode, ICustomElementViewModel } from '@aurelia/runtime';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { Navigation } from './navigation';
export interface IPopStateEvent extends PopStateEvent {
}
export interface IHashChangeEvent extends HashChangeEvent {
}
export interface IMouseEvent extends MouseEvent {
}
export interface IElement extends Element {
}
export interface IHTMLElement extends HTMLElement {
}
export declare type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
    parameters?: string[];
    title?: string | TitleFunction;
};
export declare type TitleFunction = (viewModel: IRouteableComponent, instruction: NavigationInstruction) => string;
export interface IRouteableComponent<T extends INode = INode> extends ICustomElementViewModel<T> {
    reentryBehavior?: ReentryBehavior;
    canLoad?(parameters: Record<string, unknown>, nextInstruction: Navigation, instruction: Navigation): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
    load?(parameters: Record<string, unknown>, nextInstruction: Navigation, instruction: Navigation): void | Promise<void>;
    canUnload?(nextInstruction: Navigation | null, instruction: Navigation): boolean | Promise<boolean>;
    unload?(nextInstruction: Navigation | null, instruction: Navigation): void | Promise<void>;
}
export declare const enum ReentryBehavior {
    default = "default",
    disallow = "disallow",
    load = "load",
    refresh = "refresh"
}
export interface IViewportInstruction {
    component: ComponentAppellation;
    viewport?: ViewportHandle;
    parameters?: ComponentParameters;
    children?: NavigationInstruction[];
}
export interface IRoute extends Partial<IViewportInstruction> {
    path: string;
    id?: string;
    instructions?: NavigationInstruction[] | ViewportInstruction[];
    title?: string | any;
}
export interface IComponentAndOrViewportOrNothing {
    component?: ComponentAppellation;
    viewport?: ViewportHandle;
}
export declare type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;
export declare type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;
export declare type ViewportHandle = string | Viewport;
export declare type ComponentParameters = string | Record<string, unknown> | unknown[];
//# sourceMappingURL=interfaces.d.ts.map