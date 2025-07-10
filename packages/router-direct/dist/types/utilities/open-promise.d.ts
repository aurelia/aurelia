/**
 * The OpenPromise provides an open API to a promise.
 */
export declare class OpenPromise<T = void> {
    readonly description: string;
    /**
     * Whether the promise is still pending (not settled)
     */
    isPending: boolean;
    /**
     * The actual promise
     */
    promise: Promise<T>;
    static promises: OpenPromise<any>[];
    constructor(description?: string);
    /**
     * Resolve the (open) promise.
     *
     * @param value - The value to resolve with
     */
    resolve(value?: T | PromiseLike<T>): void;
    /**
     * Reject the (open) promise.
     *
     * @param reason - The reason the promise is rejected
     */
    reject(reason?: unknown): void;
}
//# sourceMappingURL=open-promise.d.ts.map