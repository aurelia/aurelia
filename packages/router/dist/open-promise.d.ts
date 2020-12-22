export declare class OpenPromise<T = void> {
    isPending: boolean;
    promise: Promise<T | void>;
    res: (value?: T | PromiseLike<T>) => void;
    rej: (value?: T | PromiseLike<T>) => void;
    constructor();
    resolve(value?: T | PromiseLike<T>): void;
    reject(value?: T | PromiseLike<T>): void;
}
//# sourceMappingURL=open-promise.d.ts.map