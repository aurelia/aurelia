import {
  LifecycleFlags as LF,
  ISubscriberRecord,
  ICollectionSubscriber,
  IndexMap,
  LifecycleFlags,
} from '../observation.js';
import type { IAnySubscriber } from './subscriber-collection.js';

type ValueBatchRecord = [
  1,
  unknown, // oldValue
  unknown, // newValue
  LF,
];
type BatchRecord = ValueBatchRecord | IndexMap;
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
      let indexMap: IndexMap;
      let hasChanges = false;
      for (pair of newBatch) {
        subs = pair[0];
        batchRecord = pair[1];
        if (prevBatch?.has(subs)) {
          prevBatch.set(subs, batchRecord);
        }
        if (batchRecord[0] === 1) {
          subs.notify(batchRecord[1], batchRecord[2], batchRecord[3]);
        } else {
          indexMap = batchRecord as IndexMap;
          hasChanges = false;
          if (indexMap.deletedIndices.length > 0) {
            hasChanges = true;
          } else {
            for (let i = 0, ii = indexMap.length; i < ii; ++i) {
              if (indexMap[i] !== i) {
                hasChanges = true;
                break;
              }
            }
          }
          if (hasChanges) {
            subs.notifyCollection(indexMap, LifecycleFlags.none);
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
  indexMap: IndexMap,
) {
  if (!currBatch!.has(subs)) {
    currBatch!.set(subs, indexMap);
  }
}

export function addValueBatch(
  subs: ISubscriberRecord<IAnySubscriber>,
  newValue: unknown,
  oldValue: unknown,
  flags: LF,
) {
  const batchRecord = currBatch!.get(subs);
  if (batchRecord === void 0) {
    currBatch!.set(subs, [1, newValue, oldValue, flags]);
  } else {
    batchRecord[1] = newValue;
    batchRecord[2] = oldValue;
    batchRecord[3] = flags;
  }
}
