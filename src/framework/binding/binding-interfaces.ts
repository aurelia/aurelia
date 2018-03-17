export type IIndexable<T extends object = object> = T & { [key: string]: any };

export interface ICallable {
  call(...args: any[]): any;
}

export interface IDisposable {
  dispose(): void;
}

export interface IEventSubscriber extends IDisposable {

  readonly events: string[];

  subscribe(element: EventTarget, callbackOrListener: EventListenerOrEventListenerObject): void;
}

export interface ITaskQueue {
  queueMicroTask(task: ICallable): void;
}

export interface IAureliaObserver<T> {
  getValue(): T;
  setValue(newValue: T): void;
  call(): void;
}

export interface IObservable<T = any> {
  $observers: Record<string, IAureliaObserver<T>>;
}

export interface IObserverLocator {
  taskQueue: ITaskQueue;
  getObserver(obj: any, propertyName: string): IBindingTargetObserver;
  getAccessor(obj: any, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor;
  getArrayObserver(array: any[]): IBindingArrayObserver;
  getMapObserver(map: Map<any, any>): IBindingMapObserver;
}

export interface IBindingTargetObserver<TGetValue = any, TSetValue = TGetValue> {
  getValue(target: IIndexable, targetProperty: string): TGetValue;
  setValue(value: TSetValue, target: IIndexable, targetProperty: string): void;

  bind?(): void;
  unbind?(): void;

  subscribe(context: string, callable: ICallable): void;
  unsubscribe(context: string, callable: ICallable): void;
}

export interface IBindingTargetAccessor<TGetReturn = any, TSetReturn = TGetReturn> {
  getValue(obj: IIndexable, propertyName: string): TGetReturn;
  setValue(value: TSetReturn, obj: IIndexable, propertyName: string): void;
}


export interface IBindingCollectionObserver extends ISubscribable {
  getValue?(target: IIndexable, targetProperty: string): any;
  setValue?(value: any, target: IIndexable, targetProperty: string): void;
  addChangeRecord(changeRecord: any): void;
  flushChangeRecords(): void;
  reset(oldCollection: any): any;
  getLengthObserver(): any;
}

export interface IBindingArrayObserver extends IBindingCollectionObserver {
}

export interface IBindingMapObserver extends IBindingCollectionObserver {
}

export interface IBindingSetObserver extends IBindingCollectionObserver {
}

export interface IDelegationStrategy {
  none: 0;
  capturing: 1;
  bubbling: 2;
}

export interface IEventManager {
  addEventListener(
    target: EventTarget,
    targetEvent: string,
    callbackOrListener: EventListenerOrEventListenerObject,
    delegate: IDelegationStrategy[keyof IDelegationStrategy]
  ): IDisposable;
}

// ----------------

export interface OverrideContext {
  parentOverrideContext: OverrideContext;
  bindingContext: any;
}

export interface Scope {
  bindingContext: any;
  overrideContext: OverrideContext;
}

export interface IBindScope {
  bind(source: Scope): void;
  unbind(): void;
}

export interface ISubscribable {
  subscribe(context: string, callable: ICallable): void;
  unsubscribe(context: string, callable: ICallable): void;
}
