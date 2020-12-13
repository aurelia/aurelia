import type {
  LifecycleFlags as LF,
  ISubscriberRecord,
  ICollectionSubscriber,
  IndexMap,
  ISubscriber
} from '../observation.js';
import type { IAnySubscriber } from './subscriber-collection.js';

export function batch(fn: () => unknown): void {
  startBatch();
  fn();
  releaseBatch();
}
export let currentBatch: Map<ISubscriberRecord<IAnySubscriber>, IBatchRecord | ICollectionBatchRecord> = new Map();
export let batching = false;

function startBatch() {
  batching = true;
}

function releaseBatch() {
  const releasingBatch = new Map(currentBatch);
  currentBatch.clear();
  batching = false;
  releasingBatch.forEach(invokeBatch);
}

function invokeBatch(batchRecord: IBatchRecord | ICollectionBatchRecord): void {
  if (batchRecord.type === 1) {
    batchRecord.call();
  } else {
    batchRecord.call2();
  }
}

interface IBatchRecord {
  type: 1;
  rec: ISubscriberRecord<IAnySubscriber>;
  call(): void;
}

interface ICollectionBatchRecord {
  type: 2;
  rec: ISubscriberRecord<ICollectionSubscriber>;
  call2(): void;
}

export class BatchRecord implements IBatchRecord {
  public type: 1 = 1;
  public constructor(
    public readonly rec: ISubscriberRecord<ISubscriber>,
    public readonly val: unknown,
    public readonly old: unknown,
    public readonly f: LF
  ) { }

  public call(): void {
    this.rec.notify(this.val, this.old, this.f);
  }
}

export class CollectionBatchRecord implements ICollectionBatchRecord {
  public type: 2 = 2;
  public constructor(
    public readonly rec: ISubscriberRecord<ICollectionSubscriber>,
    public readonly map: IndexMap,
    public readonly f: LF
  ) { }

  public call2(): void {
    this.rec.notifyCollection(this.map, this.f);
  }
}
