import { AccessorType, IObserver, subscriberCollection, withFlushQueue } from '@aurelia/runtime';
import type { IIndexable } from "@aurelia/kernel";
import type { FlushQueue, ISubscriberCollection } from '@aurelia/runtime';
import type { Observable } from "rxjs";

const streamToObserverMap = new WeakMap<Observable<unknown>, StreamObserver>();

export interface StreamObserver<T = unknown> extends ISubscriberCollection { }

export class StreamObserver<T> implements IObserver {
  public static from<TFrom>(o: Observable<TFrom>): StreamObserver<IIndexable & TFrom> {
    let observer = streamToObserverMap.get(o);
    if (observer === void 0) {
      streamToObserverMap.set(o, observer = new StreamObserver(o));
    }
    return observer as StreamObserver<TFrom & IIndexable>;
  }

  public type: AccessorType = AccessorType.None;
  public queue!: FlushQueue;

  /** @internal */ private _value: T | undefined = void 0;
  /** @internal */ private _oldValue: T | undefined = void 0;
  protected constructor(
    _observable: Observable<T>,
  ) {
    _observable.subscribe(value => {
      this._oldValue = this._value;
      this._value = value;
      if (this.subs.count > 0) {
        this.queue.add(this);
      }
    });
  }

  public getValue() {
    return this._value;
  }

  public setValue(): void {
    // for callbag, this could be different
    throw new Error('Stream is readonly');
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, 0);
    oV = void 0;
  }
}
subscriberCollection()(StreamObserver);
withFlushQueue(StreamObserver);
let oV: unknown;
