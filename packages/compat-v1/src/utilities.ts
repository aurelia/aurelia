import { IExpressionParser, type ExpressionType } from '@aurelia/expression-parser';

/** @internal */ export const createLookup = <T = unknown>() => Object.create(null) as Record<string, T>;

/** @internal */ export const createError = (message: string) => new Error(message);

/** @internal */ export const hasOwnProperty = Object.prototype.hasOwnProperty;

/** @internal */ export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;
/** @internal */ export const isArray = <T>(v: unknown): v is T[] => v instanceof Array;

// eslint-disable-next-line @typescript-eslint/ban-types
/** @internal */ export const isFunction = <K extends Function>(v: unknown): v is K => typeof v === 'function';

/** @internal */ export const isString = (v: unknown): v is string => typeof v === 'string';
/** @internal */ export const defineProp = Object.defineProperty;
// /** @internal */ export const rethrow = (err: unknown) => { throw err; };
// /** @internal */ export const areEqual = Object.is;

/** @internal */
export const def = Reflect.defineProperty;

/** @internal */
export const defineHiddenProp = <T>(obj: object, key: PropertyKey, value: T): T => {
  def(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
  return value;
};

/** @internal */
export const ensureExpression = <TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, expressionType: ExpressionType): Exclude<TFrom, string> => {
  if (isString(srcOrExpr)) {
    return parser.parse(srcOrExpr, expressionType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
};

/** @internal */ export const etIsFunction = 'IsFunction' as const;
