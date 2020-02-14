import {
  IContainer,
  IDisposable,
  IIndexable,
  IServiceLocator,
  PLATFORM
} from '@aurelia/kernel';
import {
  ExpressionKind,
  IBinding,
  IConnectableBinding,
  IndexMap,
  IObserverLocator,
  IScope,
  ISignaler,
  ISubscribable,
  LifecycleFlags,
  State
} from '@aurelia/runtime';

export class MockBinding implements IConnectableBinding {
  public interceptor: this = this;
  public id!: number;
  public observerSlots!: number;
  public version!: number;
  public observerLocator!: IObserverLocator;
  public locator!: IServiceLocator;
  public $scope?: IScope | undefined;
  public $state!: State;

  public calls: [keyof MockBinding, ...any[]][] = [];

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    this.trace('updateTarget', value, flags);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    this.trace('updateSource', value, flags);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    this.trace('handleChange', newValue, _previousValue, flags);
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    this.trace('observeProperty', flags, obj, propertyName);
  }

  public unobserve(all?: boolean): void {
    this.trace('unobserve', all);
  }

  public addObserver(observer: ISubscribable): void {
    this.trace('addObserver', observer);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    this.trace('$bind', flags, scope);
  }

  public $unbind(flags: LifecycleFlags): void {
    this.trace('$unbind', flags);
  }

  public trace(fnName: keyof MockBinding, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockBindingBehavior {
  public calls: [keyof MockBindingBehavior, ...any[]][] = [];

  public bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('bind', flags, scope, binding, ...rest);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('unbind', flags, scope, binding, ...rest);
  }

  public trace(fnName: keyof MockBindingBehavior, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export interface MockServiceLocator extends IContainer {}
export class MockServiceLocator {
  public calls: [keyof MockServiceLocator, ...any[]][] = [];

  public constructor(public registrations: Map<any, any>) {}

  public get(key: any): any {
    this.trace('get', key);
    return this.registrations.get(key);
  }

  public trace(fnName: keyof MockServiceLocator, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export interface MockSignaler extends ISignaler {}
export class MockSignaler {
  public calls: [keyof MockSignaler, ...any[]][] = [];

  public dispatchSignal(...args: any[]): void {
    this.trace('dispatchSignal', ...args);
  }

  public addSignalListener(...args: any[]): void {
    this.trace('addSignalListener', ...args);
  }

  public removeSignalListener(...args: any[]): void {
    this.trace('removeSignalListener', ...args);
  }

  public trace(fnName: keyof MockSignaler, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockPropertySubscriber {
  public calls: [keyof MockPropertySubscriber, ...any[]][] = [];

  public handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void {
    this.trace(`handleChange`, newValue, previousValue, flags);
  }

  public trace(fnName: keyof MockPropertySubscriber, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockTracingExpression {
  public $kind: ExpressionKind = ExpressionKind.HasBind | ExpressionKind.HasUnbind;
  public calls: [keyof MockTracingExpression, ...any[]][] = [];

  public constructor(public inner: any) {}

  public evaluate(...args: any[]): any {
    this.trace('evaluate', ...args);
    return this.inner.evaluate(...args);
  }

  public assign(...args: any[]): any {
    this.trace('assign', ...args);
    return this.inner.assign(...args);
  }

  public connect(...args: any[]): any {
    this.trace('connect', ...args);
    this.inner.connect(...args);
  }

  public bind(...args: any[]): any {
    this.trace('bind', ...args);
    if (this.inner.bind) {
      this.inner.bind(...args);
    }
  }

  public unbind(...args: any[]): any {
    this.trace('unbind', ...args);
    if (this.inner.unbind) {
      this.inner.unbind(...args);
    }
  }

  public accept(...args: any[]): any {
    this.trace('accept', ...args);
    this.inner.accept(...args);
  }

  public trace(fnName: keyof MockTracingExpression, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}
export class MockValueConverter {
  public calls: [keyof MockValueConverter, ...any[]][] = [];
  public fromView!: MockValueConverter['$fromView'];
  public toView!: MockValueConverter['$toView'];

  public constructor(methods: string[]) {
    for (const method of methods) {
      this[method as 'fromView' | 'toView'] = this[`$${method}` as '$toView' | '$fromView'];
    }
  }

  public $fromView(value: any, ...args: any[]): any {
    this.trace('fromView', value, ...args);
    return value;
  }

  public $toView(value: any, ...args: any[]): any {
    this.trace('toView', value, ...args);
    return value;
  }

  public trace(fnName: keyof MockValueConverter, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockContext {
  public log: any[] = [];
}
export type ExposedContext = IContainer & IDisposable & IContainer;

export class MockBrowserHistoryLocation {
  public changeCallback?: (ev: PopStateEvent) => Promise<void>;

  private readonly states: Record<string, unknown>[] = [{}];
  private readonly paths: string[] = [''];
  private index: number = 0;

  public get length(): number {
    return this.states.length;
  }
  public get state(): Record<string, unknown> {
    return this.states[this.index];
  }
  public get path(): string {
    return this.paths[this.index];
  }

  public get pathname(): string {
    const parts = this.parts;
    // parts.shift();
    let path = parts.shift()!;
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return path;
  }
  public get search(): string {
    const parts = this.parts;
    // if (parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    const part: string = parts.shift()!;
    return part !== undefined ? `?${part}` : '';
  }
  public get hash(): string {
    const parts = this.parts;
    // if (!parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    parts.shift();
    const part: string = parts.shift()!;
    return part !== undefined ? `#${part}` : '';
  }
  public set hash(value: string) {
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    const parts = this.parts;
    // const hashFirst = parts.shift();
    let path = parts.shift();
    // if (hashFirst) {
    //   parts.shift();
    //   path += `#${value}`;
    //   const part = parts.shift();
    //   if (part !== undefined) {
    //     path += `?${part}`;
    //   }
    // } else {
    const part = parts.shift();
    if (part !== undefined) {
      path += `?${part}`;
    }
    parts.shift();
    path += `#${value}`;
    // }

    this.pushState({}, null!, path!);
    this.notifyChange();
  }

  public activate(): void { return; }
  public deactivate(): void { return; }

  // TODO: Fix a better split
  private get parts(): string[] {
    const parts = [];
    const ph = this.path.split('#');
    if (ph.length > 1) {
      parts.unshift(ph.pop());
    } else {
      parts.unshift(undefined);
    }
    const pq = ph[0].split('?');
    if (pq.length > 1) {
      parts.unshift(pq.pop());
    } else {
      parts.unshift(undefined);
    }
    parts.unshift(pq[0]);
    // const parts: (string | boolean)[] = this.path.split(/[#?]/);
    // let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
    // let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
    // parts.unshift(hash < search);
    return parts as string[];
  }

  public pushState(data: Record<string, unknown>, title: string, path: string) {
    this.states.splice(this.index + 1);
    this.paths.splice(this.index + 1);
    this.states.push(data);
    this.paths.push(path);
    this.index++;
  }

  public replaceState(data: Record<string, unknown>, title: string, path: string) {
    this.states[this.index] = data;
    this.paths[this.index] = path;
  }

  public go(movement: number) {
    const newIndex = this.index + movement;
    if (newIndex >= 0 && newIndex < this.states.length) {
      this.index = newIndex;
      this.notifyChange();
    }
  }

  private notifyChange() {
    if (this.changeCallback) {
      this.changeCallback(null as any).catch((error: Error) => { throw error; });
    }
  }
}

export class ChangeSet implements IDisposable {
  public readonly index: number;
  public readonly flags: LifecycleFlags;

  public get newValue(): any {
    return this._newValue;
  }
  public get oldValue(): any {
    return this._oldValue;
  }

  private _newValue: any;
  private _oldValue: any;

  public constructor(
    index: number,
    flags: LifecycleFlags,
    newValue: any,
    oldValue: any,
  ) {
    this.index = index;
    this.flags = flags;

    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  public dispose(): void {
    this._newValue = (void 0)!;
    this._oldValue = (void 0)!;
  }
}

export class ProxyChangeSet implements IDisposable {
  public readonly index: number;
  public readonly flags: LifecycleFlags;
  public readonly key: PropertyKey;

  public get newValue(): any {
    return this._newValue;
  }
  public get oldValue(): any {
    return this._oldValue;
  }

  private _newValue: any;
  private _oldValue: any;

  public constructor(
    index: number,
    flags: LifecycleFlags,
    key: PropertyKey,
    newValue: any,
    oldValue: any,
  ) {
    this.index = index;
    this.flags = flags;
    this.key = key;

    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  public dispose(): void {
    this._newValue = (void 0)!;
    this._oldValue = (void 0)!;
  }
}

export class CollectionChangeSet implements IDisposable {
  public readonly index: number;
  public readonly flags: LifecycleFlags;

  public get indexMap(): IndexMap {
    return this._indexMap;
  }

  private _indexMap: IndexMap;

  public constructor(
    index: number,
    flags: LifecycleFlags,
    indexMap: IndexMap,
  ) {
    this.index = index;
    this.flags = flags;

    this._indexMap = indexMap;
  }

  public dispose(): void {
    this._indexMap = (void 0)!;
  }
}

export class SpySubscriber implements IDisposable {
  public get changes(): ChangeSet[] {
    if (this._changes === void 0) {
      return PLATFORM.emptyArray;
    }
    return this._changes;
  }
  public get proxyChanges(): ProxyChangeSet[] {
    if (this._proxyChanges === void 0) {
      return PLATFORM.emptyArray;
    }
    return this._proxyChanges;
  }
  public get collectionChanges(): CollectionChangeSet[] {
    if (this._collectionChanges === void 0) {
      return PLATFORM.emptyArray;
    }
    return this._collectionChanges;
  }

  public get hasChanges(): boolean {
    return this._changes !== void 0;
  }
  public get hasProxyChanges(): boolean {
    return this._proxyChanges !== void 0;
  }
  public get hasCollectionChanges(): boolean {
    return this._collectionChanges !== void 0;
  }

  public get callCount(): number {
    return this._callCount;
  }

  private _changes?: ChangeSet[];
  private _proxyChanges?: ProxyChangeSet[];
  private _collectionChanges?: CollectionChangeSet[];

  private _callCount: number;

  public constructor() {
    this._changes = void 0;
    this._proxyChanges = void 0;
    this._collectionChanges = void 0;
    this._callCount = 0;
  }

  public handleChange(newValue: any, oldValue: any, flags: LifecycleFlags): void {
    if (this._changes === void 0) {
      this._changes = [new ChangeSet(this._callCount++, flags, newValue, oldValue)];
    } else {
      this._changes.push(new ChangeSet(this._callCount++, flags, newValue, oldValue));
    }
  }

  public handleProxyChange(key: PropertyKey, newValue: any, oldValue: any, flags: LifecycleFlags): void {
    if (this._proxyChanges === void 0) {
      this._proxyChanges = [new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue)];
    } else {
      this._proxyChanges.push(new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue));
    }
  }

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    if (this._collectionChanges === void 0) {
      this._collectionChanges = [new CollectionChangeSet(this._callCount++, flags, indexMap)];
    } else {
      this._collectionChanges.push(new CollectionChangeSet(this._callCount++, flags, indexMap));
    }
  }

  public dispose(): void {
    if (this._changes !== void 0) {
      this._changes.forEach(c => c.dispose());
      this._changes = void 0;
    }
    if (this._proxyChanges !== void 0) {
      this._proxyChanges.forEach(c => c.dispose());
      this._proxyChanges = void 0;
    }
    if (this._collectionChanges !== void 0) {
      this._collectionChanges.forEach(c => c.dispose());
      this._collectionChanges = void 0;
    }

    this._callCount = 0;
  }
}
