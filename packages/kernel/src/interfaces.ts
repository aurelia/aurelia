export interface ICallable {
  call(...args: unknown[]): unknown;
}

export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = {}> = {
  new(...args: unknown[]): T;
};

export type Decoratable<TOptional, TRequired> = Function & {
  readonly prototype: Partial<TOptional> & Required<TRequired>;
  new(...args: unknown[]): Partial<TOptional> & Required<TRequired>;
};
export type Decorated<TOptional, TRequired> = Function & {
  readonly prototype: Required<TOptional> & Required<TRequired>;
  // Constructor signatures are impossible to type correctly for use by decorators, because a synthetic constructor signature is expected to return "void"
  // but a normal constructor signature is expected to return the type that they construct.
  // Furthermore, using merged types will cause either to fail without using conditional types as well.
  // If using conditional types correctly, they would need to have intimate knowledge of any type they might be applied to (or they will still cause typing
  // errors in valid edge cases), which in turn is impossible to predict because there will be user code involved that might not fulfill any particular contract.
  // In short, the type system (as of 3.1.x) is simply not (yet?) capable of correctly handling decorators and there is nothing here that will work in all cases except for "any".
  // We can of course try again in later versions of TypeScript.
  // tslint:disable-next-line:no-any
  new(...args: unknown[]): any;
};

export type Injectable<T = {}> = Constructable<T> & { inject?: unknown[] };

// Note: use of "any" here can perfectly well be replaced by "unknown" but that would also involve fixing consumers of this
// interface since their indexed properties are now all returning "unknown" which is not assignable to anything else.
// We are however not disabling this rule with "no-any" because it is a legitimate problem that tslint is warning us about,
// and it should remind us of the fact that we have more work to do in making typings across the runtime more accurate.
// For changing this "any" to "unknown", we could either resort to upcasting at the consumer side of things (less preferable because unsafe)
// or we could simply return "unknown" at the API boundaries of consumers that return values from this object (more preferable but more work)
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
    T extends unknown[]                ? ImmutableArray<T[number]> :
    T extends Map<infer U1, infer V1>  ? ReadonlyMap<Immutable<U1>, Immutable<V1>> :
    T extends Set<infer U2>            ? ReadonlySet<Immutable<U2>> :
    T extends Record<string, infer V2> ? Record<string, Immutable<V2>> :
    T extends object                   ? Immutable<T> :
    T;

export interface ImmutableArray<T> extends ReadonlyArray<ImmutableObject<T>> {}

export type Immutable<T> = {
    readonly [K in keyof T]: ImmutableObject<T[K]>
};

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Primitive = undefined | null | number | boolean | symbol | string;

// https://github.com/palantir/tslint/issues/4235
// tslint:disable:no-shadowed-variable
export type Unwrap<T> =
    T extends (infer U)[] ? U :
    T extends (...args: unknown[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;
// tslint:enable:no-shadowed-variable

export type StrictPrimitive = string | number | boolean | null | undefined;
