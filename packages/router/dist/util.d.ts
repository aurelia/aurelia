import { RouteNode } from './route-tree.js';
export declare type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export declare class Batch {
    private stack;
    private cb;
    done: boolean;
    readonly head: Batch;
    private next;
    private constructor();
    static start(cb: (b: Batch) => void): Batch;
    push(): void;
    pop(): void;
    private invoke;
    continueWith(cb: (b: Batch) => void): Batch;
    start(): Batch;
}
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export declare function resolveAll(maybePromises: (void | Promise<void>)[]): void | Promise<void>;
export declare type ExposedPromise<T> = Promise<T> & {
    resolve(value?: T): void;
    reject(reason?: unknown): void;
};
export declare function createExposedPromise<T>(): ExposedPromise<T>;
export declare function mergeDistinct(prev: RouteNode[], next: RouteNode[]): RouteNode[];
export declare function tryStringify(value: unknown): string;
export declare function ensureArrayOfStrings(value: string | string[]): string[];
export declare function ensureString(value: string | string[]): string;
//# sourceMappingURL=util.d.ts.map