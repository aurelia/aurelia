export interface ICallable {
    call(...args: unknown[]): unknown;
}
export interface IDisposable {
    dispose(): void;
}
export declare type Constructable<T = {}> = {
    new (...args: unknown[]): T;
};
/**
 * A helper interface for declaring strongly typed decorators.
 *
 * The `Decoratable` and `Decorated` types are intended to be used together, where
 * `Decoratable` describes the (not yet decorated) target class and `Decorated`
 * describes the same target class *after* the decorator was applied to it.
 *
 * `TRequired` dictates the preconditions that the target class must conform to,
 * and `TOptional` describes the postconditions that the decorator will make the class conform
 * to. The end result (return value of the decorator) is a combination of `TOptional & TRequired`
 * where all properties/methods are defined.
 *
 * ### How it works:
 *
 * The `TOptional` and `TRequired` type arguments in the `Decoratable` interface relate
 * to the target class that the decorator will be applied to.
 * As the names imply, properties/methods defined in the `TOptional` type are optional
 * and those defined in `TRequired` are required.
 *
 * In the `Decorated` interface, the `TOptional` type argument's name is a bit misleading.
 * It is in fact transformed into a required property: it's the decorator's job to
 * add it to the prototype. They are named the same to emphasize that the type arguments
 * passed to `Decoratable` and `Decorated` must be the same.
 *
 * Example:
 *
```ts
// Neither bind() nor attach() need to be present,
// so we pass them both to TOptional. The only constraint
// for TRequired is that it must be a class, so we give
// it a type that must extend Constructable
interface IBind { bind(): void; }
interface IAttach { attach(): void; }

function customElement1<T extends Constructable>(target: Decoratable<IBind & IAttach, T>):  Decorated<IBind & IAttach, T> {
  target.prototype.bind = () => {};
  target.prototype.attach = () => {};
  return target;
}
@customElement1 // no errors
class ViewModel1 {}

// IBind is now required instead of optional
function customElement2<T extends Constructable>(target: Decoratable<IAttach, T & IBind>): Decorated<IAttach, T & IBind> {
  // this decorator apparently needs a bind()
  // method to already be defined
  target.prototype.attach = () => {};
  return target;
}
@customElement2 // type error: property 'bind' is missing
class ViewModel2 {}

@customElement2 // no errors
class ViewModel3 { public bind(): void {} }

const vm3 = new ViewModel3();
vm3.attach(); // type error: property 'attach' does not exist
// (eventhough the decorator added it)

const ViewModel4 = customElement2(ViewModel3);
const vm4 = new ViewModel4();
vm4.attach(); // no errors because we're instantiating the
// returned value from the decorator, which is the
// modified type
```
 */
export declare type Decoratable<TOptional, TRequired> = Function & {
    readonly prototype: Partial<TOptional> & Required<TRequired>;
    new (...args: unknown[]): Partial<TOptional> & Required<TRequired>;
};
/**
 * A helper interface for declaring strongly typed decorators.
 *
 * The `Decoratable` and `Decorated` types are intended to be used together.
 *
 * Please refer to the `Decoratable` type for an explanation of its application.
 *
 */
export declare type Decorated<TOptional, TRequired> = Function & {
    readonly prototype: Required<TOptional> & Required<TRequired>;
    new (...args: unknown[]): any;
};
export declare type Injectable<T = {}> = Constructable<T> & {
    inject?: Function[];
};
export declare type IIndexable<T extends object = object> = T & {
    [key: string]: any;
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
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type Primitive = undefined | null | number | boolean | symbol | string;
export declare type Unwrap<T> = T extends (infer U)[] ? U : T extends (...args: unknown[]) => infer U ? U : T extends Promise<infer U> ? U : T;
export declare type StrictPrimitive = string | number | boolean | null | undefined;
//# sourceMappingURL=interfaces.d.ts.map