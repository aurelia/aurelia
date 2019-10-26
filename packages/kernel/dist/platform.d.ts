import { IPerformance, IWindowOrWorkerGlobalScope } from './interfaces';
interface IPlatform extends IPerformance {
    /**
     * `true` if there is a `window` variable in the global scope with a `document` property.
     *
     * NOTE: this does not guarantee that the code is actually running in a browser, as some libraries tamper with globals.
     * The only conclusion that can be drawn is that the `window` global is available and likely behaves similar to how it would in a browser.
     */
    isBrowserLike: boolean;
    /**
     * `true` if there is a `self` variable (of type `object`) in the global scope with constructor name `'DedicatedWorkerGlobalScope'`.
     *
     * NOTE: this does not guarantee that the code is actually running in a web worker, as some libraries tamper with globals.
     * The only conclusion that can be drawn is that the `self` global is available and likely behaves similar to how it would in a web worker.
     */
    isWebWorkerLike: boolean;
    /**
     * `true` if there is a `process` variable in the global scope with a `versions` property which has a `node` property.
     *
     * NOTE: this is not a guarantee that the code is actually running in nodejs, as some libraries tamper with globals.
     * The only conclusion that can be drawn is that the `process` global is available and likely behaves similar to how it would in nodejs.
     */
    isNodeLike: boolean;
    global: IWindowOrWorkerGlobalScope;
    emptyArray: any[];
    emptyObject: any;
    hasOwnProperty: {
        call<V, T = object, K extends PropertyKey = PropertyKey>(target: T, key: K): target is (T & {
            [P in K]: V;
        });
        call<T, K extends keyof T>(target: T, key: K): target is (T & {
            [P in K]-?: T[P];
        });
    };
    noop(): void;
    /**
     * Restore the global `PLATFORM` object to its original state as it was immediately after module initialization.
     * Useful for when you need to stub out one or more of its methods in a unit test.
     *
     * Extraneous properties are NOT removed.
     */
    restore(): void;
}
export declare const PLATFORM: IPlatform;
export {};
//# sourceMappingURL=platform.d.ts.map