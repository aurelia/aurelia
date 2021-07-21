/**
 * Add a readonly 'queue' property on the target class to return the default FlushQueue
 * implementation
 */
export declare function withFlushQueue(): ClassDecorator;
export declare function withFlushQueue(target: Function): void;
export interface IFlushable {
    flush(): void;
}
export interface IWithFlushQueue {
    queue: FlushQueue;
}
export declare class FlushQueue {
    static readonly instance: FlushQueue;
    private _flushing;
    private readonly _items;
    get count(): number;
    add(callable: IFlushable): void;
    clear(): void;
}
//# sourceMappingURL=flush-queue.d.ts.map