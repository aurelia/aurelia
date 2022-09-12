import {
  LifecycleFlags as LF,
  ISubscriberRecord,
  ICollectionSubscriber,
  IndexMap,
  mergeIndexMaps,
  LifecycleFlags,
} from '../observation.js';
import type { IAnySubscriber } from './subscriber-collection.js';

type ValueBatchRecord = [
  1,
  unknown, // oldValue
  unknown, // newValue
  LF,
];
type CollectionBatchRecord = [
  2,
  IndexMap, // mergedMap
  IndexMap[] | undefined, // batch
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
      let mergedMap: IndexMap;
      let mapBatch: IndexMap[] | undefined;
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
          mergedMap = batchRecord[1];
          mapBatch = batchRecord[2];
          if (mapBatch !== void 0) {
            mergedMap = mergeIndexMaps(mergedMap, ...mapBatch);
          }
          hasChanges = false;
          if (mergedMap.deletedIndices.length > 0) {
            hasChanges = true;
          } else {
            for (let i = 0, ii = mergedMap.length; i < ii; ++i) {
              if (mergedMap[i] !== i) {
                hasChanges = true;
                break;
              }
            }
          }
          if (hasChanges) {
            subs.notifyCollection(mergedMap, LifecycleFlags.none);
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
  const batchRecord = currBatch!.get(subs) as CollectionBatchRecord;
  if (batchRecord === void 0) {
    currBatch!.set(subs, [2, indexMap, void 0]);
  } else {
    (batchRecord[2] ??= []).push(indexMap);
  }
}

export function addValueBatch(
  subs: ISubscriberRecord<IAnySubscriber>,
  newValue: unknown,
  oldValue: unknown,
  flags: LF,
) {
  const batchRecord = currBatch!.get(subs) as ValueBatchRecord;
  if (batchRecord === void 0) {
    currBatch!.set(subs, [1, newValue, oldValue, flags]);
  } else {
    batchRecord[1] = newValue;
    batchRecord[2] = oldValue;
    batchRecord[3] = flags;
  }
}
