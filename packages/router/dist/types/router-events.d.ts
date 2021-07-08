import { IEventAggregator, IDisposable, ILogger } from '@aurelia/kernel';
import { ManagedState } from './router.js';
import { ViewportInstructionTree } from './instructions.js';
export declare const IRouterEvents: import("@aurelia/kernel").InterfaceSymbol<IRouterEvents>;
export interface IRouterEvents extends RouterEvents {
}
export declare class RouterEvents implements IRouterEvents {
    private readonly ea;
    private readonly logger;
    private subscriptionSerial;
    private readonly subscriptions;
    constructor(ea: IEventAggregator, logger: ILogger);
    publish(event: RouterEvent): void;
    subscribe<T extends RouterEvent['name']>(event: T, callback: (message: NameToEvent[T]) => void): IDisposable;
}
export declare class LocationChangeEvent {
    readonly id: number;
    readonly url: string;
    readonly trigger: 'popstate' | 'hashchange';
    readonly state: {} | null;
    get name(): 'au:router:location-change';
    constructor(id: number, url: string, trigger: 'popstate' | 'hashchange', state: {} | null);
    toString(): string;
}
export declare class NavigationStartEvent {
    readonly id: number;
    readonly instructions: ViewportInstructionTree;
    readonly trigger: 'popstate' | 'hashchange' | 'api';
    readonly managedState: ManagedState | null;
    get name(): 'au:router:navigation-start';
    constructor(id: number, instructions: ViewportInstructionTree, trigger: 'popstate' | 'hashchange' | 'api', managedState: ManagedState | null);
    toString(): string;
}
export declare class NavigationEndEvent {
    readonly id: number;
    readonly instructions: ViewportInstructionTree;
    readonly finalInstructions: ViewportInstructionTree;
    get name(): 'au:router:navigation-end';
    constructor(id: number, instructions: ViewportInstructionTree, finalInstructions: ViewportInstructionTree);
    toString(): string;
}
export declare class NavigationCancelEvent {
    readonly id: number;
    readonly instructions: ViewportInstructionTree;
    readonly reason: unknown;
    get name(): 'au:router:navigation-cancel';
    constructor(id: number, instructions: ViewportInstructionTree, reason: unknown);
    toString(): string;
}
export declare class NavigationErrorEvent {
    readonly id: number;
    readonly instructions: ViewportInstructionTree;
    readonly error: unknown;
    get name(): 'au:router:navigation-error';
    constructor(id: number, instructions: ViewportInstructionTree, error: unknown);
    toString(): string;
}
declare type NameToEvent = {
    [LocationChangeEvent.prototype.name]: LocationChangeEvent;
    [NavigationStartEvent.prototype.name]: NavigationStartEvent;
    [NavigationEndEvent.prototype.name]: NavigationEndEvent;
    [NavigationCancelEvent.prototype.name]: NavigationCancelEvent;
    [NavigationErrorEvent.prototype.name]: NavigationErrorEvent;
};
export declare type RouterEvent = (LocationChangeEvent | NavigationStartEvent | NavigationEndEvent | NavigationCancelEvent | NavigationErrorEvent);
export {};
//# sourceMappingURL=router-events.d.ts.map