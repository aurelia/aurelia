import { Collection } from '../observation';
export interface IWatcher {
    id: number;
    observe(obj: object, property: PropertyKey): void;
    observeCollection(collection: Collection): void;
    observeLength(collection: Collection): void;
}
export declare let watching: boolean;
export declare function pauseSubscription(): void;
export declare function resumeSubscription(): void;
export declare function currentWatcher(): IWatcher | null;
export declare function enterWatcher(watcher: IWatcher): void;
export declare function exitWatcher(watcher: IWatcher): void;
//# sourceMappingURL=watcher-switcher.d.ts.map