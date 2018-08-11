export interface ICallable {
  call(...args: any[]): any;
}

export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = {}> = {
  new(...args: any[]): T;
};

export type Injectable<T = {}> = Constructable<T> & { inject?: any[] };

export type IIndexable<T extends object = object> = T & { [key: string]: any };

export type ImmutableObject<T> =
  T extends [infer A]                                                       ? Immutable<[A]> :
  T extends [infer A, infer B]                                              ? Immutable<[A, B]> :
  T extends [infer A, infer B, infer C]                                     ? Immutable<[A, B, C]> :
  T extends [infer A, infer B, infer C, infer D]                            ? Immutable<[A, B, C, D]> :
  T extends [infer A, infer B, infer C, infer D, infer E]                   ? Immutable<[A, B, C, D, E]> :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F]          ? Immutable<[A, B, C, D, E, F]> :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G] ? Immutable<[A, B, C, D, E, F, G]> :
  T extends (infer A)[]           ? ImmutableArray<A> :
  T extends Function              ? T : // can change to never to forbid functions
  T extends Map<infer U, infer V> ? ReadonlyMap<Immutable<U>, Immutable<V>> :
  T extends Set<infer U>          ? ReadonlySet<Immutable<U>> :
  T extends Record<string, infer V> ? Record<string, Immutable<V>> :
  T extends object                ? Immutable<T> :
  T;

export interface ImmutableArray<T> extends ReadonlyArray<ImmutableObject<T>> {}
export type Immutable<T> = { readonly [P in keyof T]: ImmutableObject<T[P]> };

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Primitive = undefined | null | number | boolean | symbol | string;
