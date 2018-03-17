export interface ICallable {
  call(): any;
}

export interface IDisposable {
  dispose(): void;
}

export interface IEventSubscriber extends IDisposable {

  readonly events: string[];

  subscribe(element: EventTarget, callbackOrListener: EventListenerOrEventListenerObject): void;
}

export interface IObserverLocator {
  getObserver(): any;
  getArrayObserver(array: any[]): any;
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
