export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = object> = {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/no-explicit-any
  new(...args: any[]): T;
};

export type Class<T, TStaticProps = {}> = TStaticProps & {
  readonly prototype: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new(...args: any[]): T;
};

// For resources, we want the 'constructor' property to remain on the instance type but we need to do that
// with a separate type from Class, since that one is used for other things where this constructor property
// would break the typings.
// So, in lack of a better name.. we probably need to clean this up, but this is how it works for now.
export type ConstructableClass<T, C = {}> = C & {
  readonly prototype: T & { constructor: C };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new(...args: any[]): T & { constructor: C };
};

export type IIndexable<
  TBase extends {} = {},
  TValue = unknown,
  TKey extends PropertyKey = Exclude<PropertyKey, keyof TBase>,
> = { [K in TKey]: TValue } & TBase;

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
};

export type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;

export type Primitive = undefined | null | number | boolean | string | symbol;
