export interface ICallable {
  call(...args: any[]): any;
}

export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = {}> = {
  // tslint:disable-next-line:no-any
  new(...args: any[]): T;
};

export type Decoratable<TOptional, TRequired> = Function & {
  readonly prototype: Partial<TOptional> & Required<TRequired>;
  // tslint:disable-next-line:no-any
  new(...args: any[]): Partial<TOptional> & Required<TRequired>;
};
export type Decorated<TOptional, TRequired> = Function & {
  readonly prototype: Required<TOptional> & Required<TRequired>;
  // tslint:disable-next-line:no-any
  new(...args: any[]): any;
};

export type Injectable<T = {}> = Constructable<T> & { inject?: any[] };

export type IIndexable<T extends object = object> = T & { [key: string]: any };

export type ImmutableObject<T> =
    T extends [infer A1, infer B1, infer C1, infer D1, infer E1, infer F1, infer G] ? ImmutableArray<[A1, B1, C1, D1, E1, F1, G]> :
    T extends [infer A2, infer B2, infer C2, infer D2, infer E2, infer F2]          ? ImmutableArray<[A2, B2, C2, D2, E2, F2]> :
    T extends [infer A3, infer B3, infer C3, infer D3, infer E3]                    ? ImmutableArray<[A3, B3, C3, D3, E3]> :
    T extends [infer A4, infer B4, infer C4, infer D4]                              ? ImmutableArray<[A4, B4, C4, D4]> :
    T extends [infer A5, infer B5, infer C5]                                        ? ImmutableArray<[A5, B5, C5]> :
    T extends [infer A6, infer B6]                                                  ? ImmutableArray<[A6, B6]> :
    T extends [infer A7]                                                            ? ImmutableArray<[A7]> :
    T extends (infer A)[]              ? ImmutableArray<A> :
    T extends any[]                    ? ImmutableArray<T[number]> :
    T extends Map<infer U1, infer V1>  ? ReadonlyMap<Immutable<U1>, Immutable<V1>> :
    T extends Set<infer U2>            ? ReadonlySet<Immutable<U2>> :
    T extends Record<string, infer V2> ? Record<string, Immutable<V2>> :
    T extends object                   ? Immutable<T> :
    T;

export interface ImmutableArray<T> extends ReadonlyArray<ImmutableObject<T>> {};

export type Immutable<T> = {
    readonly [K in keyof T]: ImmutableObject<T[K]>
};

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Primitive = undefined | null | number | boolean | symbol | string;

export type Unwrap<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

export type StrictPrimitive = string | number | boolean | null | undefined;
