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
    readonly length: number;
    clear(): void;
    getItem(key: string): string | null;
    key(index: number): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
    [name: string]: any;
}
export interface IWindowOrWorkerGlobalScope {
    process?: NodeJS.Process;
    readonly performance: IPerformance;
    readonly localStorage?: IStorage;
    readonly Intl: typeof Intl;
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
export declare type Diff<T extends string, U extends string> = ({
    [P in T]: P;
} & {
    [P in U]: never;
} & {
    [x: string]: never;
})[T];
export declare type Omit<T, K extends keyof T> = T extends {} ? Pick<T, Exclude<keyof T, K>> : never;
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
export declare type Primitive = undefined | null | number | boolean | string | symbol;
export declare type Unwrap<T> = T extends (infer U)[] ? U : T extends (...args: unknown[]) => infer U ? U : T extends Promise<infer U> ? U : T;
export declare type StrictPrimitive = string | number | boolean | null | undefined;
export declare type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
export declare type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{
        [Q in P]: T[P];
    }, {
        -readonly [Q in P]: T[P];
    }, P>;
}[keyof T];
export declare type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<{
        [Q in P]: T[P];
    }, {
        -readonly [Q in P]: T[P];
    }, never, P>;
}[keyof T];
export {};
//# sourceMappingURL=interfaces.d.ts.map