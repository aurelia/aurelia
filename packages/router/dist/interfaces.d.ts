import { Constructable } from '@aurelia/kernel';
import { CustomElementType, INode, IViewModel } from '@aurelia/runtime';
import { INavigatorEntry, INavigatorFlags, IStoredNavigatorEntry } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare type RouteableComponentType<C extends Constructable = Constructable> = CustomElementType<C> & {
    parameters?: string[];
};
export interface IRouteableComponent<T extends INode = INode> extends IViewModel<T> {
    reentryBehavior?: ReentryBehavior;
    canEnter?(parameters: string[] | Record<string, string>, nextInstruction: INavigatorInstruction, instruction: INavigatorInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
    enter?(parameters: string[] | Record<string, string>, nextInstruction: INavigatorInstruction, instruction: INavigatorInstruction): void | Promise<void>;
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
}
export interface IComponentAndOrViewportOrNothing {
    component?: ComponentAppellation;
    viewport?: ViewportHandle;
}
export declare type NavigationInstruction = ComponentAppellation | IViewportInstruction | ViewportInstruction;
export declare type GuardFunction = (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => boolean | ViewportInstruction[];
export declare type GuardTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;
export declare type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;
export declare type ViewportHandle = string | Viewport;
export declare type ComponentParameters = string | Record<string, unknown>;
//# sourceMappingURL=interfaces.d.ts.map