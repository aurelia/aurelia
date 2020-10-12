export interface IPerformance {
    now(): number;
}
export interface IPerformanceEntry {
    readonly duration: number;
    readonly entryType: string;
    readonly name: string;
    readonly startTime: number;
}
export declare type ITimerHandler = string | ((...args: unknown[]) => void);
declare namespace NodeJS {
    interface Process {
        env?: any;
        uptime(): number;
        hrtime(): [number, number];
    }
}
export interface IStorage {
    [name: string]: any;
    readonly length: number;
    clear(): void;
    getItem(key: string): string | null;
    key(index: number): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}
export interface IWindowOrWorkerGlobalScope {
    process?: NodeJS.Process;
    readonly performance: IPerformance;
    readonly localStorage?: IStorage;
    readonly Intl: typeof Intl;
}
export interface IDisposable {
    dispose(): void;
}
export declare type Constructable<T = {}> = {
    new (...args: any[]): T;
};
export declare type Class<T, C = {}> = C & {
    readonly prototype: T;
    new (...args: any[]): T;
};
export declare type ConstructableClass<T, C = {}> = C & {
    readonly prototype: T & {
        constructor: C;
    };
    new (...args: any[]): T & {
        constructor: C;
    };
};
export declare type IIndexable<TBase extends {} = {}, TValue = unknown, TKey extends PropertyKey = Exclude<PropertyKey, keyof TBase>> = {
    [K in TKey]: TValue;
} & TBase;
export declare type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};
export declare type Omit<T, K extends keyof T> = T extends {} ? Pick<T, Exclude<keyof T, K>> : never;
export declare type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;
export declare type Primitive = undefined | null | number | boolean | string | symbol;
export declare type Unwrap<T> = T extends (infer U)[] ? U : T extends (...args: unknown[]) => infer U ? U : T extends Promise<infer U> ? U : T;
export declare type StrictPrimitive = string | number | boolean | null | undefined;
export {};
//# sourceMappingURL=interfaces.d.ts.map