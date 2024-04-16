/* eslint-disable no-fallthrough */
import {
  CustomExpression,
  DestructuringAssignmentSingleExpression,
  // type IAstEvaluator,
  type DestructuringAssignmentExpression,
  type DestructuringAssignmentRestExpression,
  type IsExpressionOrStatement,
} from '@aurelia/expression-parser';
import { AnyFunction, IIndexable, isArrayIndex } from '@aurelia/kernel';
import { IBindingContext, IConnectable, IObservable, IOverrideContext, ISubscriber, Scope } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from '../errors';
import { isArray, isFunction, isObject, safeString } from '../utilities';
import { ISignaler } from './signaler';
import { BindingBehaviorInstance } from '../resources/binding-behavior';
import { ValueConverterInstance } from '../resources/value-converter';
import { IBinding } from './interfaces-bindings';

const ekAccessThis = 'AccessThis';
const ekAccessBoundary = 'AccessBoundary';
const ekAccessGlobal = 'AccessGlobal';
const ekAccessScope = 'AccessScope';
const ekArrayLiteral = 'ArrayLiteral';
const ekObjectLiteral = 'ObjectLiteral';
const ekPrimitiveLiteral = 'PrimitiveLiteral';
const ekTemplate = 'Template';
const ekUnary = 'Unary';
const ekCallScope = 'CallScope';
const ekCallMember = 'CallMember';
const ekCallFunction = 'CallFunction';
const ekCallGlobal = 'CallGlobal';
const ekAccessMember = 'AccessMember';
const ekAccessKeyed = 'AccessKeyed';
const ekTaggedTemplate = 'TaggedTemplate';
const ekBinary = 'Binary';
const ekConditional = 'Conditional';
const ekAssign = 'Assign';
const ekArrowFunction = 'ArrowFunction';
const ekValueConverter = 'ValueConverter';
const ekBindingBehavior = 'BindingBehavior';
const ekArrayBindingPattern = 'ArrayBindingPattern';
const ekObjectBindingPattern = 'ObjectBindingPattern';
const ekBindingIdentifier = 'BindingIdentifier';
const ekForOfStatement = 'ForOfStatement';
const ekInterpolation = 'Interpolation';
const ekArrayDestructuring = 'ArrayDestructuring';
const ekObjectDestructuring = 'ObjectDestructuring';
const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
const ekCustom = 'Custom';
const getContext = Scope.getContext;

// -----------------------------------
// this interface causes issues to sourcemap mapping in devtool
// chuck it at the bottom to avoid such issue
/**
 * An interface describing the object that can evaluate Aurelia AST
 */
export interface IAstEvaluator {
  /** describe whether the evaluator wants to evaluate in strict mode */
  strict?: boolean;
  /** describe whether the evaluator wants a bound function to be returned, in case the returned value is a function */
  boundFn?: boolean;
  /** describe whether the evaluator wants to evaluate the function call in strict mode */
  strictFnCall?: boolean;
  /** Allow an AST to retrieve a signaler instance for connecting/disconnecting */
  getSignaler?(): ISignaler;
  /** Allow an AST to retrieve a value converter that it needs */
  getConverter?<T extends {}>(name: string): ValueConverterInstance<T> | undefined;
  /** Allow an AST to retrieve a binding behavior that it needs */
  getBehavior?<T extends {}>(name: string): BindingBehaviorInstance<T> | undefined;
}

// eslint-disable-next-line max-lines-per-function
export function astEvaluate(ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
  switch (ast.$kind) {
    case ekAccessThis: {
      let oc: IOverrideContext | null = s.overrideContext;
      let currentScope: Scope | null = s;
      let i = ast.ancestor;
      while (i-- && oc) {
        currentScope = currentScope!.parent;
        oc = currentScope?.overrideContext ?? null;
      }
      return i < 1 && currentScope ? currentScope.bindingContext : void 0;
    }
    case ekAccessBoundary: {
      let currentScope: Scope | null = s;

      while (
        currentScope != null
        && !currentScope.isBoundary
      ) {
        currentScope = currentScope.parent;
      }
      return currentScope ? currentScope.bindingContext : void 0;
    }
    case ekAccessScope: {
      const obj = getContext(s, ast.name, ast.ancestor) as IBindingContext;
      if (c !== null) {
        c.observe(obj, ast.name);
      }
      const evaluatedValue: unknown = obj[ast.name];
      if (evaluatedValue == null && ast.name === '$host') {
        throw createMappedError(ErrorNames.ast_$host_not_found);
      }
      if (e?.strict) {
        // return evaluatedValue;
        return e?.boundFn && isFunction(evaluatedValue)
          ? evaluatedValue.bind(obj)
          : evaluatedValue;
      }
      return evaluatedValue == null
        ? ''
        : e?.boundFn && isFunction(evaluatedValue)
          ? evaluatedValue.bind(obj)
          : evaluatedValue;
    }
    case ekAccessGlobal:
      return globalThis[ast.name as keyof typeof globalThis];
    case ekCallGlobal: {
      const func = globalThis[ast.name as keyof typeof globalThis] as AnyFunction;
      if (isFunction(func)) {
        return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
      }
      /* istanbul-ignore-next */
      if (!e?.strictFnCall && func == null) {
        return void 0;
      }
      throw createMappedError(ErrorNames.ast_not_a_function);
    }
    case ekArrayLiteral:
      return ast.elements.map(expr => astEvaluate(expr, s, e, c));
    case ekObjectLiteral: {
      const instance: Record<string, unknown> = {};
      for (let i = 0; i < ast.keys.length; ++i) {
        instance[ast.keys[i]] = astEvaluate(ast.values[i], s, e, c);
      }
      return instance;
    }
    case ekPrimitiveLiteral:
      return ast.value;
    case ekTemplate: {
      let result = ast.cooked[0];
      for (let i = 0; i < ast.expressions.length; ++i) {
        result += String(astEvaluate(ast.expressions[i], s, e, c));
        result += ast.cooked[i + 1];
      }
      return result;
    }
    case ekUnary:
      switch (ast.operation as string) {
        case 'void':
          return void astEvaluate(ast.expression, s, e, c);
        case 'typeof':
          return typeof astEvaluate(ast.expression, s, e, c);
        case '!':
          return !(astEvaluate(ast.expression, s, e, c) as boolean);
        case '-':
          return -(astEvaluate(ast.expression, s, e, c) as number);
        case '+':
          return +(astEvaluate(ast.expression, s, e, c) as number);
        default:
          throw createMappedError(ErrorNames.ast_unknown_unary_operator, ast.operation);
      }
    case ekCallScope: {
      const args = ast.args.map(a => astEvaluate(a, s, e, c));
      const context = getContext(s, ast.name, ast.ancestor)!;
      // ideally, should observe property represents by ast.name as well
      // because it could be changed
      // todo: did it ever surprise anyone?
      const func = getFunction(e?.strictFnCall, context, ast.name);
      if (func) {
        return func.apply(context, args);
      }
      return void 0;
    }
    case ekCallMember: {
      const instance = astEvaluate(ast.object, s, e, c) as IIndexable;

      const args = ast.args.map(a => astEvaluate(a, s, e, c));
      const func = getFunction(e?.strictFnCall, instance, ast.name);
      let ret: unknown;
      if (func) {
        ret = func.apply(instance, args);
        // todo(doc): investigate & document in engineering doc the difference
        //            between observing before/after func.apply
        if (isArray(instance) && autoObserveArrayMethods.includes(ast.name)) {
          c?.observeCollection(instance);
        }
      }
      return ret;
    }
    case ekCallFunction: {
      const func = astEvaluate(ast.func, s, e, c);
      if (isFunction(func)) {
        return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
      }
      if (!e?.strictFnCall && func == null) {
        return void 0;
      }
      throw createMappedError(ErrorNames.ast_not_a_function);
    }
    case ekArrowFunction: {
      const func = (...args: unknown[]) => {
        const params = ast.args;
        const rest = ast.rest;
        const lastIdx = params.length - 1;
        const context = params.reduce<IIndexable>((map, param, i) => {
          if (rest && i === lastIdx) {
            map[param.name] = args.slice(i);
          } else {
            map[param.name] = args[i];
          }
          return map;
        }, {});
        const functionScope = Scope.fromParent(s, context);
        return astEvaluate(ast.body, functionScope, e, c);
      };
      return func;
    }
    case ekAccessMember: {
      const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
      let ret: unknown;
      if (e?.strict) {
        if (instance == null) {
          return undefined;
        }
        if (c !== null && !ast.accessGlobal) {
          c.observe(instance, ast.name);
        }
        ret = instance[ast.name];
        if (e?.boundFn && isFunction(ret)) {
          return ret.bind(instance);
        }
        return ret;
      }
      if (c !== null && isObject(instance) && !ast.accessGlobal) {
        c.observe(instance, ast.name);
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (instance) {
        ret = instance[ast.name];
        if (e?.boundFn && isFunction(ret)) {
          return ret.bind(instance);
        }
        return ret;
      }
      return '';
    }
    case ekAccessKeyed: {
      const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
      const key = astEvaluate(ast.key, s, e, c) as string;
      if (isObject(instance)) {
        if (c !== null && !ast.accessGlobal) {
          c.observe(instance, key);
        }
        return instance[key];
      }
      return instance == null
        ? void 0
        : instance[key];
    }
    case ekTaggedTemplate: {
      const results = ast.expressions.map(expr => astEvaluate(expr, s, e, c));
      const func = astEvaluate(ast.func, s, e, c);
      if (!isFunction(func)) {
        throw createMappedError(ErrorNames.ast_tagged_not_a_function);
      }
      return func(ast.cooked, ...results);
    }
    case ekBinary: {
      const left = ast.left;
      const right = ast.right;
      switch (ast.operation as string) {
        case '&&':
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          return astEvaluate(left, s, e, c) && astEvaluate(right, s, e, c);
        case '||':
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          return astEvaluate(left, s, e, c) || astEvaluate(right, s, e, c);
        case '??':
          return astEvaluate(left, s, e, c) ?? astEvaluate(right, s, e, c);
        case '==':
          // eslint-disable-next-line eqeqeq
          return astEvaluate(left, s, e, c) == astEvaluate(right, s, e, c);
        case '===':
          return astEvaluate(left, s, e, c) === astEvaluate(right, s, e, c);
        case '!=':
          // eslint-disable-next-line eqeqeq
          return astEvaluate(left, s, e, c) != astEvaluate(right, s, e, c);
        case '!==':
          return astEvaluate(left, s, e, c) !== astEvaluate(right, s, e, c);
        case 'instanceof': {
          const $right = astEvaluate(right, s, e, c);
          if (isFunction($right)) {
            return astEvaluate(left, s, e, c) instanceof $right;
          }
          return false;
        }
        case 'in': {
          const $right = astEvaluate(right, s, e, c);
          if (isObject($right)) {
            return astEvaluate(left, s, e, c) as string in $right;
          }
          return false;
        }
        // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
        // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
        // ast makes bugs in user code easier to track down for end users
        // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
        case '+': {
          const $left: unknown = astEvaluate(left, s, e, c);
          const $right: unknown = astEvaluate(right, s, e, c);

          if (e?.strict) {
            return ($left as number) + ($right as number);
          }

          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!$left || !$right) {
            if (isNumberOrBigInt($left) || isNumberOrBigInt($right)) {
              return ($left as number || 0) + ($right as number || 0);
            }
            if (isStringOrDate($left) || isStringOrDate($right)) {
              return ($left as string || '') + ($right as string || '');
            }
          }
          return ($left as number) + ($right as number);
        }
        case '-':
          return (astEvaluate(left, s, e, c) as number) - (astEvaluate(right, s, e, c) as number);
        case '*':
          return (astEvaluate(left, s, e, c) as number) * (astEvaluate(right, s, e, c) as number);
        case '/':
          return (astEvaluate(left, s, e, c) as number) / (astEvaluate(right, s, e, c) as number);
        case '%':
          return (astEvaluate(left, s, e, c) as number) % (astEvaluate(right, s, e, c) as number);
        case '<':
          return (astEvaluate(left, s, e, c) as number) < (astEvaluate(right, s, e, c) as number);
        case '>':
          return (astEvaluate(left, s, e, c) as number) > (astEvaluate(right, s, e, c) as number);
        case '<=':
          return (astEvaluate(left, s, e, c) as number) <= (astEvaluate(right, s, e, c) as number);
        case '>=':
          return (astEvaluate(left, s, e, c) as number) >= (astEvaluate(right, s, e, c) as number);
        default:
          throw createMappedError(ErrorNames.ast_unknown_binary_operator, ast.operation);
      }
    }
    case ekConditional:
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return astEvaluate(ast.condition, s, e, c) ? astEvaluate(ast.yes, s, e, c) : astEvaluate(ast.no, s, e, c);
    case ekAssign:
      return astAssign(ast.target, s, e, astEvaluate(ast.value, s, e, c));
    case ekValueConverter: {
      const vc = e?.getConverter?.(ast.name);
      if (vc == null) {
        throw createMappedError(ErrorNames.ast_converter_not_found, ast.name);
      }
      if ('toView' in vc) {
        return vc.toView(astEvaluate(ast.expression, s, e, c), ...ast.args.map(a => astEvaluate(a, s, e, c)));
      }
      return astEvaluate(ast.expression, s, e, c);
    }
    case ekBindingBehavior:
      return astEvaluate(ast.expression, s, e, c);
    case ekBindingIdentifier:
      return ast.name;
    case ekForOfStatement:
      return astEvaluate(ast.iterable, s, e, c);
    case ekInterpolation:
      if (ast.isMulti) {
        let result = ast.parts[0];
        let i = 0;
        for (; i < ast.expressions.length; ++i) {
          result += safeString(astEvaluate(ast.expressions[i], s, e, c));
          result += ast.parts[i + 1];
        }
        return result;
      } else {
        return `${ast.parts[0]}${astEvaluate(ast.firstExpression, s, e, c)}${ast.parts[1]}`;
      }
    case ekDestructuringAssignmentLeaf:
      return astEvaluate(ast.target, s, e, c);
    case ekArrayDestructuring: {
      return ast.list.map(x => astEvaluate(x, s, e, c));
    }
    // TODO: this should come after batch
    // as a destructuring expression like [x, y] = value
    //
    // should only trigger change only once:
    // batch(() => {
    //   object.x = value[0]
    //   object.y = value[1]
    // })
    //
    // instead of twice:
    // object.x = value[0]
    // object.y = value[1]
    case ekArrayBindingPattern:
    // TODO
    // similar to array binding ast, this should only come after batch
    // for a single notification per destructing,
    // regardless number of property assignments on the scope binding context
    case ekObjectBindingPattern:
    case ekObjectDestructuring:
    default:
      return void 0;
    case ekCustom:
      return ast.evaluate(s, e, c);
  }
}

export function astAssign(ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
  switch (ast.$kind) {
    case ekAccessScope: {
      if (ast.name === '$host') {
        throw createMappedError(ErrorNames.ast_no_assign_$host);
      }
      const obj = getContext(s, ast.name, ast.ancestor) as IObservable;
      return obj[ast.name] = val;
    }
    case ekAccessMember: {
      const obj = astEvaluate(ast.object, s, e, null) as IObservable;
      if (isObject(obj)) {
        if (ast.name === 'length' && isArray(obj) && !isNaN(val as number)) {
          obj.splice(val as number);
        } else {
          obj[ast.name] = val;
        }
      } else {
        astAssign(ast.object, s, e, { [ast.name]: val });
      }
      return val;
    }
    case ekAccessKeyed: {
      const instance = astEvaluate(ast.object, s, e, null) as IIndexable;
      const key = astEvaluate(ast.key, s, e, null) as string;
      if (isArray(instance)) {
        if (key === 'length' && !isNaN(val as number)) {
          instance.splice(val as number);
          return val;
        }
        if (isArrayIndex(key)) {
          instance.splice(key as unknown as number, 1, val);
          return val;
        }
      }
      return instance[key] = val;
    }
    case ekAssign:
      astAssign(ast.value, s, e, val);
      return astAssign(ast.target, s, e, val);
    case ekValueConverter: {
      const vc = e?.getConverter?.(ast.name);
      if (vc == null) {
        throw createMappedError(ErrorNames.ast_converter_not_found, ast.name);
      }
      if ('fromView' in vc) {
        val = vc.fromView!(val, ...ast.args.map(a => astEvaluate(a, s, e, null)));
      }
      return astAssign(ast.expression, s, e, val);
    }
    case ekBindingBehavior:
      return astAssign(ast.expression, s, e, val);
    case ekArrayDestructuring:
    case ekObjectDestructuring: {
      const list = ast.list;
      const len = list.length;
      let i: number;
      let item: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
      for (i = 0; i < len; i++) {
        item = list[i];
        switch (item.$kind) {
          case ekDestructuringAssignmentLeaf:
            astAssign(item, s, e, val);
            break;
          case ekArrayDestructuring:
          case ekObjectDestructuring: {
            if (typeof val !== 'object' || val === null) {
              throw createMappedError(ErrorNames.ast_destruct_null);
            }
            let source = astEvaluate(item.source!, Scope.create(val), e, null);
            if (source === void 0 && item.initializer) {
              source = astEvaluate(item.initializer, s, e, null);
            }
            astAssign(item, s, e, source);
            break;
          }
        }
      }
      break;
    }
    case ekDestructuringAssignmentLeaf: {
      if (ast instanceof DestructuringAssignmentSingleExpression) {
        if (val == null) { return; }
        if (typeof val !== 'object') {
          throw createMappedError(ErrorNames.ast_destruct_null);
        }
        let source = astEvaluate(ast.source, Scope.create(val), e, null);
        if (source === void 0 && ast.initializer) {
          source = astEvaluate(ast.initializer, s, e, null);
        }
        astAssign(ast.target, s, e, source);
      } else {
        if (val == null) { return; }
        if (typeof val !== 'object') {
          throw createMappedError(ErrorNames.ast_destruct_null);
        }

        const indexOrProperties = ast.indexOrProperties;

        let restValue: Record<string, unknown> | unknown[];
        if (isArrayIndex(indexOrProperties)) {
          if (!Array.isArray(val)) {
            throw createMappedError(ErrorNames.ast_destruct_null);
          }
          restValue = val.slice(indexOrProperties);
        } else {
          restValue = Object
            .entries(val)
            .reduce((acc, [k, v]) => {
              if (!indexOrProperties.includes(k)) { acc[k] = v; }
              return acc;
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            }, {} as Record<string, unknown>);
        }
        astAssign(ast.target, s, e, restValue);
      }
      break;
    }
    case ekCustom:
      return ast.assign(s, e, val);
    default:
      return void 0;
  }
}

type BindingWithBehavior = IConnectable & IBinding & { [key: string]: BindingBehaviorInstance | undefined };

export function astBind(ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectable & IBinding) {
  switch (ast.$kind) {
    case ekBindingBehavior: {
      const name = ast.name;
      const key = ast.key;
      const behavior = b.getBehavior?.<BindingBehaviorInstance>(name);
      if (behavior == null) {
        throw createMappedError(ErrorNames.ast_behavior_not_found, name);
      }
      if ((b as BindingWithBehavior)[key] === void 0) {
        (b as BindingWithBehavior)[key] = behavior;
        behavior.bind?.(s, b, ...ast.args.map(a => astEvaluate(a, s, b, null)));
      } else {
        throw createMappedError(ErrorNames.ast_behavior_duplicated, name);
      }
      astBind(ast.expression, s, b);
      return;
    }
    case ekValueConverter: {
      const name = ast.name;
      const vc = b.getConverter?.(name);
      if (vc == null) {
        throw createMappedError(ErrorNames.ast_converter_not_found, name);
      }
      // note: the cast is expected. To connect, it just needs to be a IConnectable
      // though to work with signal, it needs to have `handleChange`
      // so having `handleChange` as a guard in the connectable as a safe measure is needed
      // to make sure signaler works
      const signals = vc.signals;
      if (signals != null) {
        const signaler = b.getSignaler?.();
        const ii = signals.length;
        let i = 0;
        for (; i < ii; ++i) {
          signaler?.addSignalListener(signals[i], b as unknown as ISubscriber);
        }
      }
      astBind(ast.expression, s, b);
      return;
    }
    case ekForOfStatement: {
      astBind(ast.iterable, s, b);
      break;
    }
    case ekCustom: {
      ast.bind?.(s, b);
    }
  }
}

export function astUnbind(ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectable & IBinding) {
  switch (ast.$kind) {
    case ekBindingBehavior: {
      const key = ast.key;
      const $b = b as BindingWithBehavior;
      if ($b[key] !== void 0) {
        $b[key]!.unbind?.(s, b);
        $b[key] = void 0;
      }
      astUnbind(ast.expression, s, b);
      break;
    }
    case ekValueConverter: {
      const vc = b.getConverter?.(ast.name);
      if (vc?.signals === void 0) {
        return;
      }
      const signaler = b.getSignaler?.();
      let i = 0;
      for (; i < vc.signals.length; ++i) {
        signaler?.removeSignalListener(vc.signals[i], b as unknown as ISubscriber);
      }
      astUnbind(ast.expression, s, b);
      break;
    }
    case ekForOfStatement: {
      astUnbind(ast.iterable, s, b);
      break;
    }
    case ekCustom: {
      ast.unbind?.(s, b);
    }
  }
}

const getFunction = (mustEvaluate: boolean | undefined, obj: object, name: string): ((...args: unknown[]) => unknown) | null => {
  const func = obj == null ? null : (obj as IIndexable)[name];
  if (isFunction(func)) {
    return func as (...args: unknown[]) => unknown;
  }
  if (!mustEvaluate && func == null) {
    return null;
  }
  throw createMappedError(ErrorNames.ast_name_is_not_a_function, name);
};

/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
const isNumberOrBigInt = (value: unknown): value is number | bigint => {
  switch (typeof value) {
    case 'number':
    case 'bigint':
      return true;
    default:
      return false;
  }
};

/**
 * Determines if the value passed is a string or Date for parsing purposes
 *
 * @param value - Value to evaluate
 */
const isStringOrDate = (value: unknown): value is string | Date => {
  switch (typeof value) {
    case 'string':
      return true;
    case 'object':
      return value instanceof Date;
    default:
      return false;
  }
};

const autoObserveArrayMethods =
  'at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort'.split(' ');
// sort,      // bad supported, self mutation + unclear dependency

// push,      // not supported, self mutation + unclear dependency
// pop,       // not supported, self mutation + unclear dependency
// shift,     // not supported, self mutation + unclear dependency
// splice,    // not supported, self mutation + unclear dependency
// unshift,   // not supported, self mutation + unclear dependency
// reverse,   // not supported, self mutation + unclear dependency

// keys,    // not meaningful in template
// values,  // not meaningful in template
// entries, // not meaningful in template
