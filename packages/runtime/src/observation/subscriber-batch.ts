import type {
  LifecycleFlags as LF,
  ISubscriberRecord,
  ICollectionSubscriber,
  IndexMap,
} from '../observation.js';
import type { IAnySubscriber } from './subscriber-collection.js';

type ValueBatchRecord = [1, unknown, unknown, LF];
type CollectionBatchRecord = [2, IndexMap, LF];
type BatchRecord = ValueBatchRecord | CollectionBatchRecord;
type Batch = Map<ISubscriberRecord<IAnySubscriber>, BatchRecord>;

let currBatch: Batch | null = new Map();
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
          indexMap = batchRecord[1];
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
            subs.notifyCollection(indexMap, batchRecord[2]);
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
  flags: LF,
) {
  let batchRecord = currBatch!.get(subs);
  if (batchRecord === void 0) {
    currBatch!.set(subs, [2, indexMap, flags]);
  } else {
    batchRecord[1] = indexMap;
    batchRecord[2] = flags;
  }
}

export function addValueBatch(
  subs: ISubscriberRecord<IAnySubscriber>,
  newValue: unknown,
  oldValue: unknown,
  flags: LF,
) {
  let batchRecord = currBatch!.get(subs);
  if (batchRecord === void 0) {
    currBatch!.set(subs, [1, newValue, oldValue, flags]);
  } else {
    batchRecord[1] = newValue;
    batchRecord[2] = oldValue;
    batchRecord[3] = flags;
  }
}
