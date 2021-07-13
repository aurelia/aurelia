import { ExpressionKind, LifecycleFlags } from '@aurelia/runtime-html';
import type { IContainer, IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { Scope } from '@aurelia/runtime-html';
import type { IBinding, IConnectableBinding, IndexMap, IObserverLocator, ISignaler, BindingObserverRecord, Collection, ISubscribable, ICollectionSubscribable } from '@aurelia/runtime';
export declare class MockBinding implements IConnectableBinding {
    interceptor: this;
    observerSlots: number;
    version: number;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    $scope?: Scope | undefined;
    isBound: boolean;
    value: unknown;
    obs: BindingObserverRecord;
    calls: [keyof MockBinding, ...any[]][];
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    observeProperty(obj: IIndexable, propertyName: string): void;
    observeCollection(col: Collection): void;
    subscribeTo(subscribable: ISubscribable | ICollectionSubscribable): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    trace(fnName: keyof MockBinding, ...args: any[]): void;
    dispose(): void;
}
export declare class MockBindingBehavior {
    calls: [keyof MockBindingBehavior, ...any[]][];
    bind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...rest: any[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, binding: IBinding, ...rest: any[]): void;
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
    handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void;
    trace(fnName: keyof MockPropertySubscriber, ...args: any[]): void;
}
export declare class MockTracingExpression {
    inner: any;
    $kind: ExpressionKind;
    calls: [keyof MockTracingExpression, ...any[]][];
    constructor(inner: any);
    evaluate(...args: any[]): any;
    assign(...args: any[]): any;
    connect(...args: any[]): any;
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
export declare type ExposedContext = IContainer & IDisposable & IContainer;
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
    private notifyChange;
}
export declare class ChangeSet implements IDisposable {
    readonly index: number;
    readonly flags: LifecycleFlags;
    get newValue(): any;
    get oldValue(): any;
    private _newValue;
    private _oldValue;
    constructor(index: number, flags: LifecycleFlags, newValue: any, oldValue: any);
    dispose(): void;
}
export declare class ProxyChangeSet implements IDisposable {
    readonly index: number;
    readonly flags: LifecycleFlags;
    readonly key: PropertyKey;
    get newValue(): any;
    get oldValue(): any;
    private _newValue;
    private _oldValue;
    constructor(index: number, flags: LifecycleFlags, key: PropertyKey, newValue: any, oldValue: any);
    dispose(): void;
}
export declare class CollectionChangeSet implements IDisposable {
    readonly index: number;
    readonly flags: LifecycleFlags;
    get indexMap(): IndexMap;
    private _indexMap;
    constructor(index: number, flags: LifecycleFlags, indexMap: IndexMap);
    dispose(): void;
}
export declare class SpySubscriber implements IDisposable {
    get changes(): ChangeSet[];
    get proxyChanges(): ProxyChangeSet[];
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
    handleChange(newValue: any, oldValue: any, flags: LifecycleFlags): void;
    handleProxyChange(key: PropertyKey, newValue: any, oldValue: any, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    dispose(): void;
}
//# sourceMappingURL=mocks.d.ts.map