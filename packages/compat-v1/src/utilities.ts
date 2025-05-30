import { IExpressionParser, type ExpressionType } from '@aurelia/expression-parser';
import { isString, Protocol } from '@aurelia/kernel';
import { Metadata } from '@aurelia/metadata';

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

/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const hasMetadata = Metadata.has;
/** @internal */ export const defineMetadata = Metadata.define;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
