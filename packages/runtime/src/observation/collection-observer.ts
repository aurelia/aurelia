
import { Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  Collection,
  CollectionKind,
  CollectionObserver,
  createIndexMap,
  IBindingTargetObserver,
  ICollectionObserver,
  ISubscriber
} from '../observation';
import { collectionSubscriberCollection } from './subscriber-collection';
import { targetObserver } from './target-observer';

const slice = Array.prototype.slice;

// tslint:disable-next-line: no-ignored-initial-value // false positive
function flushBatch(this: CollectionObserver, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this['constructor'].name, 'flushBatch', slice.call(arguments)); }
  this.callCollectionSubscribers(this.indexMap, flags | this.persistentFlags);
  if (this.lengthObserver != void 0) {
    (this.lengthObserver as typeof this.lengthObserver & { patch(flags: number): void }).patch(LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance | this.persistentFlags);
  }
  this.resetIndexMap();
  if (Tracer.enabled) { Tracer.leave(); }
}

function resetIndexMapIndexed(this: ICollectionObserver<CollectionKind.indexed>): void {
  this.indexMap = createIndexMap(this.collection.length);
}

function resetIndexMapKeyed(this: ICollectionObserver<CollectionKind.keyed>): void {
  this.indexMap = createIndexMap(this.collection.size);
}

function getLengthObserver(this: CollectionObserver): CollectionLengthObserver {
  return this.lengthObserver === undefined ? (this.lengthObserver = new CollectionLengthObserver(this as Collection&ICollectionObserver<CollectionKind>, this.lengthPropertyName)) : this.lengthObserver as CollectionLengthObserver;
}

function notify(this: CollectionObserver): void {
  this.lifecycle.enqueueBatch(this);
}

export function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    collectionSubscriberCollection()(target);
    const proto = target.prototype as CollectionObserver;

    proto.resetIndexMap = (kind & CollectionKind.indexed) > 0 ? resetIndexMapIndexed : resetIndexMapKeyed;
    proto.flushBatch = flushBatch;
    proto.getLengthObserver = getLengthObserver;

    proto.notify = notify;

    if (proto.subscribeToCollection === void 0) {
      proto.subscribeToCollection = proto.addCollectionSubscriber;
    }
    if (proto.unsubscribeFromCollection === void 0) {
      proto.unsubscribeFromCollection = proto.removeCollectionSubscriber;
    }
  };
}

export interface CollectionLengthObserver extends IBindingTargetObserver<Collection, string> {}

@targetObserver()
export class CollectionLengthObserver implements CollectionLengthObserver {
  public currentValue: number;

  public obj: Collection & { length: number; size: number };
  public propertyKey: 'length' | 'size';

  constructor(obj: Collection, propertyKey: 'length' | 'size') {
    this.obj = obj as Collection & { length: number; size: number };
    this.propertyKey = propertyKey;

    this.currentValue = (obj as Collection & { length: number; size: number })[propertyKey];
  }

  public getValue(): number {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: number): void {
    (this.obj as Writable<this['obj']>)[this.propertyKey] = newValue;
  }

  public patch(flags: LifecycleFlags): void {
    const newValue = this.obj[this.propertyKey];
    const oldValue = this.currentValue;
    if (oldValue !== newValue) {
      (this.obj as Writable<this['obj']>)[this.propertyKey] = newValue;
      this.currentValue = newValue;
      this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
  }
}
