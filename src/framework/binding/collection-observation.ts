import { calcSplices, projectArraySplices } from './array-change-records';
import { getChangeRecords } from './map-change-records';
import { SubscriberCollection } from './subscriber-collection';
import { ITaskQueue, ICallable, IBindingCollectionObserver } from './binding-interfaces';

type Collection = any[] | Map<any, any> | Set<any>;

export class ModifyCollectionObserver extends SubscriberCollection implements IBindingCollectionObserver {
  private taskQueue: ITaskQueue;
  private queued = false;
  private changeRecords: any[] = null;
  private oldCollection: Collection = null;
  private collection: Collection;
  private lengthPropertyName: string;
  private lengthObserver: CollectionLengthObserver = null;

  constructor(taskQueue: ITaskQueue, collection: Collection) {
    super();
    this.taskQueue = taskQueue;
    this.collection = collection;
    this.lengthPropertyName = (collection instanceof Map) || (collection instanceof Set) ? 'size' : 'length';
  }

  subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }

  addChangeRecord(changeRecord: any) {
    if (!this.hasSubscribers() && !this.lengthObserver) {
      return;
    }

    if (changeRecord.type === 'splice') {
      let index = changeRecord.index;
      let arrayLength = changeRecord.object.length;
      if (index > arrayLength) {
        index = arrayLength - changeRecord.addedCount;
      } else if (index < 0) {
        index = arrayLength + changeRecord.removed.length + index - changeRecord.addedCount;
      }
      if (index < 0) {
        index = 0;
      }
      changeRecord.index = index;
    }

    if (this.changeRecords === null) {
      this.changeRecords = [changeRecord];
    } else {
      this.changeRecords.push(changeRecord);
    }

    if (!this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  flushChangeRecords() {
    if ((this.changeRecords && this.changeRecords.length) || this.oldCollection) {
      this.call();
    }
  }

  reset(oldCollection: Collection) {
    this.oldCollection = oldCollection;

    if (this.hasSubscribers() && !this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  getLengthObserver() {
    return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this.collection));
  }

  call() {
    let changeRecords = this.changeRecords;
    let oldCollection = this.oldCollection;
    let records;

    this.queued = false;
    this.changeRecords = [];
    this.oldCollection = null;

    if (this.hasSubscribers()) {
      if (oldCollection) {
        // TODO (martingust) we might want to refactor this to a common, independent of collection type, way of getting the records
        if ((this.collection instanceof Map) || (this.collection instanceof Set)) {
          records = getChangeRecords(oldCollection as Map<any, any> | Set<any>);
        } else {
          //we might need to combine this with existing change records....
          records = calcSplices(this.collection, 0, this.collection.length, oldCollection, 0, (oldCollection as any[]).length);
        }
      } else {
        if ((this.collection instanceof Map) || (this.collection instanceof Set)) {
          records = changeRecords;
        } else {
          records = projectArraySplices(this.collection, changeRecords);
        }
      }

      this.callSubscribers(records);
    }

    if (this.lengthObserver) {
      this.lengthObserver.call((this.collection as any)[this.lengthPropertyName]);
    }
  }
}

export class CollectionLengthObserver extends SubscriberCollection {
  private collection: Collection;
  private lengthPropertyName: string;
  private currentValue: number;

  constructor(collection: Collection) {
    super();
    this.collection = collection;
    this.lengthPropertyName = collection instanceof Map || collection instanceof Set ? 'size' : 'length';
    this.currentValue = (collection as any)[this.lengthPropertyName];
  }

  getValue() {
    return (this.collection as any)[this.lengthPropertyName];
  }

  setValue(newValue: number) {
    (this.collection as any)[this.lengthPropertyName] = newValue;
  }

  subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }

  call(newValue: number) {
    let oldValue = this.currentValue;
    this.callSubscribers(newValue, oldValue);
    this.currentValue = newValue;
  }
}
