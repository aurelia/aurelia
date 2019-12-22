import { Constructable } from '@aurelia/kernel';
import { CustomElementType, INode, ICustomElementViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
    parameters?: string[];
};
export interface IRouteableComponent<T extends INode = INode> extends ICustomElementViewModel<T> {
    reentryBehavior?: ReentryBehavior;
    canEnter?(parameters: Record<string, unknown>, nextInstruction: INavigatorInstruction, instruction: INavigatorInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
    enter?(parameters: Record<string, unknown>, nextInstruction: INavigatorInstruction, instruction: INavigatorInstruction): void | Promise<void>;
    canLeave?(nextInstruction: INavigatorInstruction | null, instruction: INavigatorInstruction): boolean | Promise<boolean>;
    leave?(nextInstruction: INavigatorInstruction | null, instruction: INavigatorInstruction): void | Promise<void>;
}
export declare const enum ReentryBehavior {
    default = "default",
    disallow = "disallow",
    enter = "enter",
    refresh = "refresh"
}
export interface INavigatorInstruction extends INavigatorEntry {
    navigation?: INavigatorFlags;
    previous?: IStoredNavigatorEntry;
    repeating?: boolean;
}
export interface IViewportInstruction {
    component: ComponentAppellation;
    viewport?: ViewportHandle;
    parameters?: ComponentParameters;
    children?: NavigationInstruction[];
}
export interface IRoute {
    path: string;
    id?: string;
    instructions: NavigationInstruction[] | ViewportInstruction[];
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