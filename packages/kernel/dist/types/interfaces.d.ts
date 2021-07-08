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
export declare type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;
export declare type Primitive = undefined | null | number | boolean | string | symbol;
//# sourceMappingURL=interfaces.d.ts.map