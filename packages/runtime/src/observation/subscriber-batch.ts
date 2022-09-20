import {
  type ISubscriberRecord,
  type ICollectionSubscriber,
  type IndexMap,
  type Collection,
} from '../observation';
import type { IAnySubscriber } from './subscriber-collection';

type ValueBatchRecord = [
  1,
  unknown, // oldValue
  unknown, // newValue
];
type CollectionBatchRecord = [
  2,
  Collection,
  IndexMap,
];
type BatchRecord = ValueBatchRecord | CollectionBatchRecord;
type Batch = Map<ISubscriberRecord<IAnySubscriber>, BatchRecord>;

let currBatch: Batch | null = new Map();
// eslint-disable-next-line import/no-mutable-exports
export let batching = false;

export function batch(fn: () => unknown): void {
  const prevBatch = currBatch;
  const newBatch: Batch = currBatch = new Map();
  batching = true;
  try {
    fn();
  } finally {
    currBatch = null;
    batching = false;
    try {
      let pair: [ISubscriberRecord<IAnySubscriber>, BatchRecord];
      let subs: ISubscriberRecord<IAnySubscriber>;
      let batchRecord: BatchRecord;
      let col: Collection;
      let indexMap: IndexMap;
      let hasChanges = false;
      let i: number;
      let ii: number;
      for (pair of newBatch) {
        subs = pair[0];
        batchRecord = pair[1];
        if (prevBatch?.has(subs)) {
          prevBatch.set(subs, batchRecord);
        }
        if (batchRecord[0] === 1) {
          subs.notify(batchRecord[1], batchRecord[2]);
        } else {
          col = batchRecord[1];
          indexMap = batchRecord[2];
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
            subs.notifyCollection(col, indexMap);
          }
        }
      }
    } finally {
      currBatch = prevBatch;
    }
  }
}

export function addCollectionBatch(
  subs: ISubscriberRecord<ICollectionSubscriber>,
  collection: Collection,
  indexMap: IndexMap,
) {
  if (!currBatch!.has(subs)) {
    currBatch!.set(subs, [2, collection, indexMap]);
  }
}

export function addValueBatch(
  subs: ISubscriberRecord<IAnySubscriber>,
  newValue: unknown,
  oldValue: unknown,
) {
  const batchRecord = currBatch!.get(subs);
  if (batchRecord === void 0) {
    currBatch!.set(subs, [1, newValue, oldValue]);
  } else {
    batchRecord[1] = newValue;
    batchRecord[2] = oldValue;
  }
}
