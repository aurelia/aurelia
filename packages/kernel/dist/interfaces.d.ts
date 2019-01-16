export interface IPerformance {
    now(): number;
    mark(name: string): void;
    measure(name: string, start?: string, end?: string): void;
    getEntriesByName(name: string): IPerformanceEntry[];
    getEntriesByType(type: string): IPerformanceEntry[];
    clearMarks(name?: string): void;
    clearMeasures(name?: string): void;
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
export interface IWindowOrWorkerGlobalScope {
    process?: NodeJS.Process;
    readonly performance: IPerformance;
    clearInterval(handle?: number): void;
    clearTimeout(handle?: number): void;
    setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
    setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
    requestAnimationFrame(callback: IFrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
}
export interface IFrameRequestCallback {
    (time: number): void;
}
export interface ICallable {
    call(...args: unknown[]): unknown;
}
export interface IDisposable {
    dispose(): void;
}
export declare type Constructable<T = {}> = {
    new (...args: unknown[]): T & any;
};
export declare type Class<T, C = IIndexable> = C & {
    readonly prototype: T;
    new (...args: unknown[]): T;
};
export declare type InterfaceSymbol<T = unknown> = (target: Injectable<T>, property: string, index: number) => any;
export declare type Injectable<T = {}> = Constructable<T> & {
    inject?: (InterfaceSymbol | Constructable)[];
};
export declare type IIndexable<T extends object = object> = T & {
    [key: string]: unknown;
};
export declare type ImmutableObject<T> = T extends [infer A1, infer B1, infer C1, infer D1, infer E1, infer F1, infer G] ? ImmutableArray<[A1, B1, C1, D1, E1, F1, G]> : T extends [infer A2, infer B2, infer C2, infer D2, infer E2, infer F2] ? ImmutableArray<[A2, B2, C2, D2, E2, F2]> : T extends [infer A3, infer B3, infer C3, infer D3, infer E3] ? ImmutableArray<[A3, B3, C3, D3, E3]> : T extends [infer A4, infer B4, infer C4, infer D4] ? ImmutableArray<[A4, B4, C4, D4]> : T extends [infer A5, infer B5, infer C5] ? ImmutableArray<[A5, B5, C5]> : T extends [infer A6, infer B6] ? ImmutableArray<[A6, B6]> : T extends [infer A7] ? ImmutableArray<[A7]> : T extends (infer A)[] ? ImmutableArray<A> : T extends unknown[] ? ImmutableArray<T[number]> : T extends Map<infer U1, infer V1> ? ReadonlyMap<Immutable<U1>, Immutable<V1>> : T extends Set<infer U2> ? ReadonlySet<Immutable<U2>> : T extends Record<string, infer V2> ? Record<string, Immutable<V2>> : T extends object ? Immutable<T> : T;
export interface ImmutableArray<T> extends ReadonlyArray<ImmutableObject<T>> {
}
export declare type Immutable<T> = {
    readonly [K in keyof T]: ImmutableObject<T[K]>;
};
export declare type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;
export declare type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;
export declare type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends {
    [_ in keyof T]: infer U;
} ? U : never;
export declare type RequiredKnownKeys<T> = {
    [K in keyof T]: {} extends Pick<T, K> ? never : K;
} extends {
    [_ in keyof T]: infer U;
} ? ({} extends U ? never : U) : never;
export declare type OptionalKnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : {} extends Pick<T, K> ? K : never;
} extends {
    [_ in keyof T]: infer U;
} ? ({} extends U ? never : U) : never;
export declare type ValuesOf<T> = T extends {
    [_ in keyof T]: infer U;
} ? U : never;
export declare type RequiredValuesOf<T> = T extends {
    [_ in keyof T]: infer U;
} ? U : never;
export declare type OptionalValuesOf<T> = T extends {
    [_ in keyof T]: infer U;
} ? U : never;
export declare type NoInfer<T> = T & {
    [K in keyof T]: T[K];
};
export declare type Purify<T extends string> = {
    [P in T]: T;
}[T];
export declare type Public<T> = {
    [P in keyof T]: T[P];
};
export declare type Param0<Func> = Func extends (a: infer T, ...args: any[]) => any ? T : never;
export declare type Param1<Func> = Func extends (a: any, b: infer T, ...args: any[]) => any ? T : never;
export declare type Param2<Func> = Func extends (a: any, b: any, c: infer T, ...args: any[]) => any ? T : never;
export declare type Param3<Func> = Func extends (a: any, b: any, c: any, d: infer T, ...args: any[]) => any ? T : never;
export declare type Pick2<T, K1 extends keyof T, K2 extends keyof T[K1]> = {
    [P1 in K1]: {
        [P2 in K2]: (T[K1])[P2];
    };
};
export declare type Pick3<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]> = {
    [P1 in K1]: {
        [P2 in K2]: {
            [P3 in K3]: ((T[K1])[K2])[P3];
        };
    };
};
export declare type Primitive = undefined | null | number | boolean | symbol | string;
export declare type Unwrap<T> = T extends (infer U)[] ? U : T extends (...args: unknown[]) => infer U ? U : T extends Promise<infer U> ? U : T;
export declare type StrictPrimitive = string | number | boolean | null | undefined;
export {};
//# sourceMappingURL=interfaces.d.ts.map