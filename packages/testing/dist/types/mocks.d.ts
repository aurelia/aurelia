import { Key } from '@aurelia/kernel';
import { type Scope, type IndexMap, type IObserverLocator, type Collection, type ISubscribable, type ICollectionSubscribable, type IObserverLocatorBasedConnectable, type IObserverRecord } from '@aurelia/runtime';
import { type ISignaler, type IRateLimitOptions, type IBinding } from '@aurelia/runtime-html';
import type { IContainer, IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
export declare class MockBinding implements IBinding, IObserverLocatorBasedConnectable {
    observerSlots: number;
    version: number;
    oL: IObserverLocator;
    l: IServiceLocator;
    scope?: Scope | undefined;
    isBound: boolean;
    value: unknown;
    obs: IObserverRecord;
    calls: [keyof MockBinding, ...any[]][];
    get(key: Key): never;
    updateTarget(value: unknown): void;
    updateSource(value: unknown): void;
    handleChange(newValue: unknown, _previousValue: unknown): void;
    handleCollectionChange(collection: Collection, indexMap: IndexMap): void;
    observe(obj: IIndexable, propertyName: string): void;
    observeCollection(col: Collection): void;
    subscribeTo(subscribable: ISubscribable | ICollectionSubscribable): void;
    bind(scope: Scope): void;
    unbind(): void;
    trace(fnName: keyof MockBinding, ...args: any[]): void;
    dispose(): void;
    limit(opts: IRateLimitOptions): {
        dispose: () => void;
    };
    useScope(scope: Scope): void;
}
export declare class MockBindingBehavior {
    calls: [keyof MockBindingBehavior, ...any[]][];
    bind(scope: Scope, binding: IBinding, ...rest: any[]): void;
    unbind(scope: Scope, binding: IBinding, ...rest: any[]): void;
    trace(fnName: keyof MockBindingBehavior, ...args: any[]): void;
}
export interface MockServiceLocator extends IContainer {
}
export declare class MockServiceLocator {
    registrations: Map<any, any>;
    calls: [keyof MockServiceLocator, ...any[]][];
    constructor(registrations: Map<any, any>);
    get(key: any): any;
    trace(fnName: keyof MockServiceLocator, ...args: any[]): void;
}
export interface MockSignaler extends ISignaler {
}
export declare class MockSignaler {
    calls: [keyof MockSignaler, ...any[]][];
    dispatchSignal(...args: any[]): void;
    addSignalListener(...args: any[]): void;
    removeSignalListener(...args: any[]): void;
    trace(fnName: keyof MockSignaler, ...args: any[]): void;
}
export declare class MockPropertySubscriber {
    calls: [keyof MockPropertySubscriber, ...any[]][];
    handleChange(newValue: any, previousValue: any): void;
    trace(fnName: keyof MockPropertySubscriber, ...args: any[]): void;
}
export declare class MockTracingExpression {
    inner: any;
    $kind: 'Custom';
    hasBind: true;
    hasUnbind: true;
    calls: [keyof MockTracingExpression, ...any[]][];
    constructor(inner: any);
    evaluate(...args: any[]): any;
    assign(...args: any[]): any;
    bind(...args: any[]): any;
    unbind(...args: any[]): any;
    accept(...args: any[]): any;
    trace(fnName: keyof MockTracingExpression, ...args: any[]): void;
}
export declare class MockValueConverter {
    calls: [keyof MockValueConverter, ...any[]][];
    fromView: MockValueConverter['$fromView'];
    toView: MockValueConverter['$toView'];
    constructor(methods: string[]);
    $fromView(value: any, ...args: any[]): any;
    $toView(value: any, ...args: any[]): any;
    trace(fnName: keyof MockValueConverter, ...args: any[]): void;
}
export declare class MockContext {
    log: any[];
}
export type ExposedContext = IContainer & IDisposable;
export declare class MockBrowserHistoryLocation {
    changeCallback?: (ev: PopStateEvent) => Promise<void>;
    private readonly states;
    private readonly paths;
    private index;
    get length(): number;
    get state(): Record<string, unknown>;
    get path(): string;
    get pathname(): string;
    get search(): string;
    get hash(): string;
    set hash(value: string);
    activate(): void;
    deactivate(): void;
    private get parts();
    pushState(data: Record<string, unknown>, title: string, path: string): void;
    replaceState(data: Record<string, unknown>, title: string, path: string): void;
    go(movement: number): void;
    back(): void;
    forward(): void;
    private notifyChange;
}
export declare class ChangeSet implements IDisposable {
    readonly index: number;
    get newValue(): any;
    get oldValue(): any;
    private _newValue;
    private _oldValue;
    constructor(index: number, newValue: any, oldValue: any);
    dispose(): void;
}
export declare class ProxyChangeSet implements IDisposable {
    readonly index: number;
    readonly key: PropertyKey;
    get newValue(): any;
    get oldValue(): any;
    private _newValue;
    private _oldValue;
    constructor(index: number, key: PropertyKey, newValue: any, oldValue: any);
    dispose(): void;
}
export declare class CollectionChangeSet implements IDisposable {
    readonly index: number;
    get indexMap(): IndexMap;
    private _indexMap;
    constructor(index: number, indexMap: IndexMap);
    dispose(): void;
}
export declare class SpySubscriber implements IDisposable {
    get changes(): ChangeSet[];
    get collectionChanges(): CollectionChangeSet[];
    get hasChanges(): boolean;
    get hasProxyChanges(): boolean;
    get hasCollectionChanges(): boolean;
    get callCount(): number;
    private _changes?;
    private _proxyChanges?;
    private _collectionChanges?;
    private _callCount;
    constructor();
    handleChange(newValue: any, oldValue: any): void;
    handleCollectionChange(collection: Collection, indexMap: IndexMap): void;
    dispose(): void;
}
//# sourceMappingURL=mocks.d.ts.map