import { DI } from '@aurelia/kernel';
import { IChangeTracker } from './observation';
import { nativeAdd } from './set-observer';

/**
 * Represents a set of ChangeTrackers (typically observers) containing changes that can be flushed in some way (e.g. by calling subscribers).
 *
 * The ChangeSet itself also implements the IChangeTracker interface, allowing sets of changes to be grouped together and composed into a tree.
 */
export interface IChangeSet extends IChangeTracker {
  /**
   * A promise that resolves when the current set of changes has been flushed.
   * This is the same promise that is returned from `add`
   */
  readonly flushed: Promise<void>;

  /**
   * Indicates whether this ChangeSet is currently flushing changes
   */
  readonly flushing: boolean;

  /**
   * The number of ChangeTrackers that this set contains
   */
  readonly size: number;

  /**
   * Flushes the changes for all ChangeTrackers currently present in this set.
   */
  flushChanges(): void;

  /**
   * Returns this set of ChangeTrackers as an array.
   */
  toArray(): IChangeTracker[];

  /**
   * Adds a ChangeTracker to the set. Similar to how a normal Set behaves, adding the same item multiple times has the same effect as adding it once.
   *
   * @returns A promise that resolves when the changes have been flushed.
   */
  add(changeTracker: IChangeTracker): Promise<void>;

  /**
   * Returns true if the specified ChangeTracker is present in the set.
   */
  has(changeTracker: IChangeTracker): boolean;
}

export const IChangeSet = DI.createInterface<IChangeSet>()
  .withDefault(x => x.singleton(<any>ChangeSet));

/*@internal*/
export class ChangeSet extends Set<IChangeTracker> implements IChangeSet {
  public flushed: Promise<void>;
  public flushing: boolean = false;

  /*@internal*/
  public promise: Promise<void> = Promise.resolve();

  public toArray(): IChangeTracker[] {
    const items = new Array<IChangeTracker>(this.size);
    let i = 0;
    for (const item of this.keys()) {
      items[i++] = item;
    }
    return items;
  }

  /**
   * This particular implementation is recursive; any changes added as a side-effect of flushing changes, will be flushed during the same tick.
   */
  public flushChanges = (): void => {
    this.flushing = true;
    while (this.size > 0) {
      const items = this.toArray();
      this.clear();
      const len = items.length;
      let i = 0;
      while (i < len) {
        items[i++].flushChanges();
      }
    }
    this.flushing = false;
  }

  public add(changeTracker: IChangeTracker): never; // this is a hack to keep intellisense/type checker from nagging about signature compatibility
  public add(changeTracker: IChangeTracker): Promise<void> {
    if (this.size === 0) {
      this.flushed = this.promise.then(this.flushChanges);
    }
    nativeAdd.call(this, changeTracker);
    return this.flushed;
  }
}
