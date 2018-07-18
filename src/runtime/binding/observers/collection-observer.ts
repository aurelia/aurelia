import { IDisposable } from "../../../kernel/interfaces";

export type Collection = any[] | Map<any, any> | Set<any>;
export type IObservedCollection = Collection & { $observer: CollectionObserver };

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export interface IImmediateSubscriber {
  (origin: string, args?: IArguments): void;
}

export interface IBatchedSubscriber {
  (indexMap: Array<number>): void;
}

export abstract class CollectionObserver implements IDisposable {
  public collection: IObservedCollection;
  public indexMap: Array<number>;
  public hasChanges: boolean;
  public lengthPropertyName: 'size' | 'length';
  public collectionKind: CollectionKind;

  private immediateSubscriber0: IImmediateSubscriber;
  private immediateSubscriber1: IImmediateSubscriber;
  private immediateSubscribers: Array<IImmediateSubscriber>;
  private immediateSubscriberCount: number;
  private batchedSubscriber0: IBatchedSubscriber;
  private batchedSubscriber1: IBatchedSubscriber;
  private batchedSubscribers: Array<IBatchedSubscriber>;
  private batchedSubscriberCount: number;

  constructor(collection: Collection, lengthPropertyName: 'size' | 'length', collectionKind: CollectionKind) {
    this.collection = <any>collection;
    this.lengthPropertyName = lengthPropertyName;
    this.collectionKind = collectionKind;
    this.collection.$observer = <any>this;
    this.resetIndexMap();
    this.hasChanges = false;
    this.immediateSubscribers = new Array();
    this.batchedSubscribers = new Array();
    this.immediateSubscriberCount = 0;
    this.batchedSubscriberCount = 0;
  }

  resetIndexMap(): void {
    const len = this.collection[this.lengthPropertyName];
    const indexMap = this.indexMap = new Array(len);
    let i = 0;
    while (i < len) {
      indexMap[i] = i++;
    }
  }

  notifyImmediate(origin: string, args?: IArguments): void {
    // todo: optimize / generalize
    this.hasChanges = true;
    const count = this.immediateSubscriberCount;
    switch(count) {
      case 0:
        return;
      case 1:
        this.immediateSubscriber0(origin, args);
        return;
      case 2:
        this.immediateSubscriber0(origin, args);
        this.immediateSubscriber1(origin, args);
        return;
      default:
        this.immediateSubscriber0(origin, args);
        this.immediateSubscriber1(origin, args);
        let i = 2;
        while (i < count) {
          this.immediateSubscribers[i](origin, args);
          i++;
        }
    }
  }

  notifyBatched(indexMap: Array<number>): void {
    // todo: optimize / generalize
    const count = this.batchedSubscriberCount;
    switch(count) {
      case 0:
        return;
      case 1:
        this.batchedSubscriber0(indexMap);
        return;
      case 2:
        this.batchedSubscriber0(indexMap);
        this.batchedSubscriber1(indexMap);
        return;
      default:
        this.batchedSubscriber0(indexMap);
        this.batchedSubscriber1(indexMap);
        let i = 2;
        while (i < count) {
          this.batchedSubscribers[i](indexMap);
          i++;
        }
    }
  }

  flushChanges(): void {
    if (this.hasChanges) {
      this.notifyBatched(this.indexMap);
      this.resetIndexMap();
      this.hasChanges = false;
    }
  }

  subscribeBatched(subscriber: IBatchedSubscriber): void {
    switch (this.batchedSubscriberCount) {
      case 0:
        this.batchedSubscriber0 = subscriber;
        break;
      case 1:
        this.batchedSubscriber1 = subscriber;
        break;
      default:
        this.batchedSubscribers.push(subscriber);
        break;
    }
    this.batchedSubscriberCount++;
  }

  unsubscribeBatched(subscriber: IBatchedSubscriber): void {
    if (subscriber === this.batchedSubscriber0) {
      this.batchedSubscriber0 = this.batchedSubscriber1;
      this.batchedSubscriber1 = this.batchedSubscribers.shift();
    } else if (subscriber === this.batchedSubscriber1) {
      this.batchedSubscriber1 = this.batchedSubscribers.shift();
    } else {
      const i = this.batchedSubscribers.indexOf(subscriber);
      if (i > -1) {
        this.batchedSubscribers.splice(i, 1);
      }
    }
    this.batchedSubscriberCount--;
  }

  subscribeImmediate(subscriber: IImmediateSubscriber): void {
    switch (this.immediateSubscriberCount) {
      case 0:
        this.immediateSubscriber0 = subscriber;
        break;
      case 1:
        this.immediateSubscriber1 = subscriber;
        break;
      default:
        this.immediateSubscribers.push(subscriber);
        break;
    }
    this.immediateSubscriberCount++;
  }

  unsubscribeImmediate(subscriber: IImmediateSubscriber): void {
    if (subscriber === this.immediateSubscriber0) {
      this.immediateSubscriber0 = this.immediateSubscriber1;
      this.immediateSubscriber1 = this.immediateSubscribers.shift();
    } else if (subscriber === this.immediateSubscriber1) {
      this.immediateSubscriber1 = this.immediateSubscribers.shift();
    } else {
      const i = this.immediateSubscribers.indexOf(subscriber);
      if (i > -1) {
        this.immediateSubscribers.splice(i, 1);
      }
    }
    this.immediateSubscriberCount--;
  }

  subscribe(subscriber: IImmediateSubscriber): void { }

  unsubscribe(subscriber: IImmediateSubscriber): void { }
  
  dispose(): void {
    this.collection.$observer = undefined;
    this.collection = null;
    this.indexMap = null;
    this.batchedSubscriber0 = null;
    this.batchedSubscriber1 = null;
    this.batchedSubscribers = null;
    this.immediateSubscriber0 = null;
    this.immediateSubscriber1 = null;
    this.immediateSubscribers = null;
    this.batchedSubscribers = null;
    this.immediateSubscribers = null;
  }
}
