import { IServiceLocator } from '@aurelia/kernel';
import { IDirtyChecker, INodeObserverLocator, IObserverLocator } from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { EventSubscriber } from './event-delegator';
import { ISVGAnalyzer } from './svg-analyzer';
import type { IContainer } from '@aurelia/kernel';
import type { IAccessor, IObserver, ICollectionObserver, CollectionKind } from '@aurelia/runtime';
import type { INode } from '../dom';
export declare type IHtmlObserverConstructor = new (el: INode, key: PropertyKey, handler: EventSubscriber, observerLocator: IObserverLocator, locator: IServiceLocator) => IObserver;
export interface INodeObserverConfig extends Partial<NodeObserverConfig> {
    events: string[];
}
export declare class NodeObserverConfig {
    /**
     * The observer constructor to use
     */
    type: IHtmlObserverConstructor;
    /**
     * Indicates the list of events can be used to observe a particular property
     */
    readonly events: string[];
    /**
     * Indicates whether this property is readonly, so observer wont attempt to assign value
     * example: input.files
     */
    readonly readonly?: boolean;
    /**
     * A default value to assign to the corresponding property if the incoming value is null/undefined
     */
    readonly default?: unknown;
    constructor(config: INodeObserverConfig);
}
export declare class NodeObserverLocator implements INodeObserverLocator {
    private readonly locator;
    private readonly platform;
    private readonly dirtyChecker;
    private readonly svgAnalyzer;
    allowDirtyCheck: boolean;
    private readonly globalLookup;
    private readonly eventsLookup;
    private readonly overrides;
    constructor(locator: IServiceLocator, platform: IPlatform, dirtyChecker: IDirtyChecker, svgAnalyzer: ISVGAnalyzer);
    static register(container: IContainer): void;
    handles(obj: unknown, _key: PropertyKey): boolean;
    useConfig(config: Record<string, Record<string, INodeObserverConfig>>): void;
    useConfig(nodeName: string, key: PropertyKey, events: INodeObserverConfig): void;
    useGlobalConfig(config: Record<string, INodeObserverConfig>): void;
    useGlobalConfig(key: PropertyKey, events: INodeObserverConfig): void;
    getAccessor(obj: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
    getObserver(el: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export declare function getCollectionObserver(collection: unknown, observerLocator: IObserverLocator): ICollectionObserver<CollectionKind> | undefined;
//# sourceMappingURL=observer-locator.d.ts.map