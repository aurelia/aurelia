import { IPerformanceEntry, ITimerHandler, IWindowOrWorkerGlobalScope } from './interfaces';
declare function $noop(): void;
export declare const PLATFORM: {
    global: IWindowOrWorkerGlobalScope;
    emptyArray: any[];
    emptyObject: any;
    noop: typeof $noop;
    now: () => number;
    mark: (name: string) => void;
    measure: (name: string, start?: string | undefined, end?: string | undefined) => void;
    getEntriesByName: (name: string) => IPerformanceEntry[];
    getEntriesByType: (type: string) => IPerformanceEntry[];
    clearMarks: (name?: string | undefined) => void;
    clearMeasures: (name?: string | undefined) => void;
    hasOwnProperty: {
        call<V, T = object, K extends string | number | symbol = string | number | symbol>(target: T, key: K): target is T & { [P in K]: V; };
        call<T, K extends keyof T>(target: T, key: K): target is T & { [P in K]-?: T[P]; };
    };
    requestAnimationFrame(callback: (time: number) => void): number;
    cancelAnimationFrame(handle: number): void;
    clearInterval(handle?: number | undefined): void;
    clearTimeout(handle?: number | undefined): void;
    setInterval(handler: ITimerHandler, timeout?: number | undefined, ...args: any[]): number;
    setTimeout(handler: ITimerHandler, timeout?: number | undefined, ...args: any[]): number;
};
export {};
//# sourceMappingURL=platform.d.ts.map