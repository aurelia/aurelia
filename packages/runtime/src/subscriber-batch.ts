import { areEqual } from '@aurelia/kernel';
import {
  createIndexMap,
  type ISubscriberRecord,
  type ICollectionSubscriber,
  type IndexMap,
  type Collection,
  type ICollectionChangeTracker,
} from './interfaces';
import type { IAnySubscriber } from './subscriber-collection';

type ValueBatchRecord = [
  1,
  unknown, // newValue
  unknown, // oldValue
];
type CollectionBatchRecord = [
  2,
  ICollectionChangeTracker<Collection>,
  IndexMap,
];
type BatchRecord = ValueBatchRecord | CollectionBatchRecord;
interface Batch {
  records: Map<ISubscriberRecord<IAnySubscriber>, BatchRecord>;
  parent: Batch | null;
}

let currBatch: Batch | null = null;
// eslint-disable-next-line import/no-mutable-exports
export let batching = false;
// eslint-disable-next-line import/no-mutable-exports
export let flushing = false;

export function batch(fn: () => unknown): void {
  const prevBatch = currBatch;
  const wasBatching = batching;
  const wasFlushing = flushing;
  const newBatch: Batch = currBatch = { records: new Map(), parent: prevBatch };
  batching = true;
  try {
    fn();
  } finally {
    batching = false;
    flushing = true;
    try {
      let pair: [ISubscriberRecord<IAnySubscriber>, BatchRecord];
      let subs: ISubscriberRecord<IAnySubscriber>;
      let batchRecord: BatchRecord;
      let observer: ICollectionChangeTracker<Collection>;
      let indexMap: IndexMap;
      let hasChanges = false;
      let i: number;
      let ii: number;
      for (pair of newBatch.records) {
        subs = pair[0];
        batchRecord = pair[1];
        // Inner batches still flush at their own boundary. Do not replay the
        // same changes when an enclosing batch subsequently finishes.
        const previous = takeBatchRecord(subs)!;
        if (batchRecord[0] === 1) {
          batchRecord[2] = previous[2];
          if (!areEqual(batchRecord[1], batchRecord[2])) {
            subs.notify(batchRecord[1], batchRecord[2]);
          }
        } else {
          observer = batchRecord[1];
          indexMap = batchRecord[2];
          // A preceding subscriber may already have mutated and delivered this
          // collection. Its old batch record must not be delivered twice.
          if (observer.indexMap !== indexMap) {
            continue;
          }
          // Start the next map before subscribers can mutate the collection again.
          observer.indexMap = createIndexMap(indexMap.length);
          hasChanges = false;
          if (indexMap.deletedIndices.length > 0) {
            hasChanges = true;
          } else {
            for (i = 0, ii = indexMap.length; i < ii; ++i) {
              if (indexMap[i] !== i) {
                hasChanges = true;
                break;
              }
            }
          }
          if (hasChanges) {
            subs.notifyCollection(observer.collection, indexMap);
          }
        }
      }
    } finally {
      currBatch = prevBatch;
      batching = wasBatching;
      flushing = wasFlushing;
    }
  }
}

export function addCollectionBatch(
  subs: ISubscriberRecord<ICollectionSubscriber>,
  observer: ICollectionChangeTracker<Collection>,
) {
  const records = currBatch!.records;
  if (!records.has(subs)) {
    records.set(subs, [2, observer, observer.indexMap]);
  } else {
    records.get(subs)![2] = observer.indexMap;
  }
}

export function addValueBatch(
  subs: ISubscriberRecord<IAnySubscriber>,
  newValue: unknown,
  oldValue: unknown,
) {
  const records = currBatch!.records;
  const batchRecord = records.get(subs);
  if (batchRecord === void 0) {
    records.set(subs, [1, newValue, oldValue]);
  } else {
    batchRecord[1] = newValue;
  }
}

export function takeBatchRecord(subs: ISubscriberRecord<IAnySubscriber>): BatchRecord | undefined {
  let record: BatchRecord | undefined;
  // An inner delivery includes earlier outer changes. Keep the oldest record
  // so value subscribers receive the original old value.
  for (let current = currBatch; current !== null; current = current.parent) {
    const pending = current.records.get(subs);
    if (pending !== void 0) {
      record = pending;
      current.records.delete(subs);
    }
  }
  return record;
}
