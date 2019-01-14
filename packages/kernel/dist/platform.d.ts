import { IPerformanceEntry, ITimerHandler, IWindowOrWorkerGlobalScope } from './interfaces';
declare function $noop(): void;
export declare class Ticker {
    private head;
    private requestId;
    private frameDelta;
    private lastTime;
    private started;
    private promise;
    private resolve;
    private tick;
    constructor();
    add(fn: (frameDelta?: number) => void, context: unknown): this;
    remove(fn: (frameDelta?: number) => void, context: unknown): this;
    start(): void;
    stop(): void;
    update(currentTime?: number): void;
    waitForNextTick(): Promise<number>;
    private tryRequest;
    private tryCancel;
}
export declare const PLATFORM: {
    global: IWindowOrWorkerGlobalScope;
    ticker: Ticker;
    emptyArray: ReadonlyArray<any>;
    emptyObject: Readonly<{}>;
    noop: typeof $noop;
    now: () => number;
    mark: (name: string) => void;
    measure: (name: string, start?: string, end?: string) => void;
    getEntriesByName: (name: string) => IPerformanceEntry[];
    getEntriesByType: (type: string) => IPerformanceEntry[];
    clearMarks: (name?: string) => void;
    clearMeasures: (name?: string) => void;
    camelCase(input: string): string;
    kebabCase(input: string): string;
    toArray<T = unknown>(input: ArrayLike<T>): T[];
    requestAnimationFrame(callback: (time: number) => void): number;
    clearInterval(handle?: number): void;
    clearTimeout(handle?: number): void;
    setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
    setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
};
export {};
//# sourceMappingURL=platform.d.ts.map