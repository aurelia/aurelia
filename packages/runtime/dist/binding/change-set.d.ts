import { IChangeTracker } from './observation';
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
export declare const IChangeSet: import("@aurelia/kernel/dist/di").InterfaceSymbol<IChangeSet>;
//# sourceMappingURL=change-set.d.ts.map