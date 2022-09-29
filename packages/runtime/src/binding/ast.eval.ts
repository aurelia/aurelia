/* eslint-disable no-fallthrough */
import { IIndexable, isArrayIndex } from '@aurelia/kernel';
import { IConnectable, IOverrideContext, IBindingContext, IObservable } from '../observation';
import { Scope } from '../observation/binding-context';
import { ISignaler } from '../observation/signaler';
import { createError, isArray, isFunction, safeString } from '../utilities-objects';
import { ExpressionKind, IsExpressionOrStatement, IAstEvaluator, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, BindingBehaviorInstance } from './ast';
import { IConnectableBinding } from './connectable';

const getContext = Scope.getContext;
// eslint-disable-next-line max-lines-per-function
export function astEvaluate(ast: IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
  switch (ast.$kind) {
    case ExpressionKind.AccessThis: {
      let oc: IOverrideContext | null = s.overrideContext;
      let currentScope: Scope | null = s;
      let i = ast.ancestor;
      while (i-- && oc) {
        currentScope = currentScope!.parent;
        oc = currentScope?.overrideContext ?? null;
      }
      return i < 1 && currentScope ? currentScope.bindingContext : void 0;
    }
    case ExpressionKind.AccessScope: {
      const obj = getContext(s, ast.name, ast.ancestor) as IBindingContext;
      if (c !== null) {
        c.observe(obj, ast.name);
      }
      const evaluatedValue: unknown = obj[ast.name];
      if (evaluatedValue == null && ast.name === '$host') {
        if (__DEV__)
          throw createError(`AUR0105: Unable to find $host context. Did you forget [au-slot] attribute?`);
        else
          throw createError(`AUR0105`);
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
    case ExpressionKind.ArrayLiteral:
      return ast.elements.map(expr => astEvaluate(expr, s, e, c));
    case ExpressionKind.ObjectLiteral: {
      const instance: Record<string, unknown> = {};
      for (let i = 0; i < ast.keys.length; ++i) {
        instance[ast.keys[i]] = astEvaluate(ast.values[i], s, e, c);
      }
      return instance;
    }
    case ExpressionKind.PrimitiveLiteral:
      return ast.value;
    case ExpressionKind.Template: {
      let result = ast.cooked[0];
      for (let i = 0; i < ast.expressions.length; ++i) {
        result += String(astEvaluate(ast.expressions[i], s, e, c));
        result += ast.cooked[i + 1];
      }
      return result;
    }
    case ExpressionKind.Unary:
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
          if (__DEV__)
            throw createError(`AUR0109: Unknown unary operator: '${ast.operation}'`);
          else
            throw createError(`AUR0109:${ast.operation}`);
      }
    case ExpressionKind.CallScope: {
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
    case ExpressionKind.CallMember: {
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
    case ExpressionKind.CallFunction: {
      const func = astEvaluate(ast.func, s, e, c);
      if (isFunction(func)) {
        return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
      }
      if (!e?.strictFnCall && func == null) {
        return void 0;
      }
      if (__DEV__)
        throw createError(`AUR0107: Expression is not a function.`);
      else
        throw createError(`AUR0107`);
    }
    case ExpressionKind.ArrowFunction: {
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
    case ExpressionKind.AccessMember: {
      const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
      let ret: unknown;
      if (e?.strict) {
        if (instance == null) {
          return instance;
        }
        if (c !== null) {
          c.observe(instance, ast.name);
        }
        ret = instance[ast.name];
        if (e?.boundFn && isFunction(ret)) {
          return ret.bind(instance);
        }
        return ret;
      }
      if (c !== null && instance instanceof Object) {
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
    case ExpressionKind.AccessKeyed: {
      const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
      if (instance instanceof Object) {
        const key = astEvaluate(ast.key, s, e, c) as string;
        if (c !== null) {
          c.observe(instance, key);
        }
        return instance[key];
      }
      return void 0;
    }
    case ExpressionKind.TaggedTemplate: {
      const results = ast.expressions.map(expr => astEvaluate(expr, s, e, c));
      const func = astEvaluate(ast.func, s, e, c);
      if (!isFunction(func)) {
        if (__DEV__)
          throw createError(`AUR0110: Left-hand side of tagged template expression is not a function.`);
        else
          throw createError(`AUR0110`);
      }
      return func(ast.cooked, ...results);
    }
    case ExpressionKind.Binary: {
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
          if ($right instanceof Object) {
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
          if (__DEV__)
            throw createError(`AUR0108: Unknown binary operator: '${ast.operation}'`);
          else
            throw createError(`AUR0108:${ast.operation}`);
      }
    }
    case ExpressionKind.Conditional:
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return astEvaluate(ast.condition, s, e, c) ? astEvaluate(ast.yes, s, e, c) : astEvaluate(ast.no, s, e, c);
    case ExpressionKind.Assign:
      return astAssign(ast.target, s, e, astEvaluate(ast.value, s, e, c));
    case ExpressionKind.ValueConverter: {
      const vc = e?.getConverter?.(ast.name);
      if (vc == null) {
        if (__DEV__)
          throw createError(`AUR0103: ValueConverter named '${ast.name}' could not be found. Did you forget to register it as a dependency?`);
        else
          throw createError(`AUR0103:${ast.name}`);
      }
      if ('toView' in vc) {
        return vc.toView(astEvaluate(ast.expression, s, e, c), ...ast.args.map(a => astEvaluate(a, s, e, c)));
      }
      return astEvaluate(ast.expression, s, e, c);
    }
    case ExpressionKind.BindingBehavior:
      return astEvaluate(ast.expression, s, e, c);
    case ExpressionKind.BindingIdentifier:
      return ast.name;
    case ExpressionKind.ForOfStatement:
      return astEvaluate(ast.iterable, s, e, c);
    case ExpressionKind.Interpolation:
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
    case ExpressionKind.ArrayBindingPattern:
    // TODO
    // similar to array binding ast, this should only come after batch
    // for a single notification per destructing,
    // regardless number of property assignments on the scope binding context
    case ExpressionKind.ObjectBindingPattern:
    case ExpressionKind.ArrayDestructuring:
    case ExpressionKind.ObjectDestructuring:
    case ExpressionKind.DestructuringAssignmentLeaf:
    default:
      return void 0;
    case ExpressionKind.Custom:
      return ast.evaluate(s, e, c);
  }
}

export function astAssign(ast: IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
  switch (ast.$kind) {
    case ExpressionKind.AccessScope: {
      if (ast.name === '$host') {
        if (__DEV__)
          throw createError(`AUR0106: Invalid assignment. $host is a reserved keyword.`);
        else
          throw createError(`AUR0106`);
      }
      const obj = getContext(s, ast.name, ast.ancestor) as IObservable;
      if (obj instanceof Object) {
        if (obj.$observers?.[ast.name] !== void 0) {
          obj.$observers[ast.name].setValue(val);
          return val;
        } else {
          return obj[ast.name] = val;
        }
      }
      return void 0;
    }
    case ExpressionKind.AccessMember: {
      const obj = astEvaluate(ast.object, s, e, null) as IObservable;
      if (obj instanceof Object) {
        if (obj.$observers !== void 0 && obj.$observers[ast.name] !== void 0) {
          obj.$observers[ast.name].setValue(val);
        } else {
          obj[ast.name] = val;
        }
      } else {
        astAssign(ast.object, s, e, { [ast.name]: val });
      }
      return val;
    }
    case ExpressionKind.AccessKeyed: {
      const instance = astEvaluate(ast.object, s, e, null) as IIndexable;
      const key = astEvaluate(ast.key, s, e, null) as string;
      return instance[key] = val;
    }
    case ExpressionKind.Assign:
      astAssign(ast.value, s, e, val);
      return astAssign(ast.target, s, e, val);
    case ExpressionKind.ValueConverter: {
      const vc = e?.getConverter?.(ast.name);
      if (vc == null) {
        throw converterNotFoundError(ast.name);
      }
      if ('fromView' in vc) {
        val = vc.fromView!(val, ...ast.args.map(a => astEvaluate(a, s, e, null)));
      }
      return astAssign(ast.expression, s, e, val);
    }
    case ExpressionKind.BindingBehavior:
      return astAssign(ast.expression, s, e, val);
    case ExpressionKind.ArrayDestructuring:
    case ExpressionKind.ObjectDestructuring: {
      const list = ast.list;
      const len = list.length;
      let i: number;
      let item: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
      for (i = 0; i < len; i++) {
        item = list[i];
        switch (item.$kind) {
          case ExpressionKind.DestructuringAssignmentLeaf:
            astAssign(item, s, e, val);
            break;
          case ExpressionKind.ArrayDestructuring:
          case ExpressionKind.ObjectDestructuring: {
            if (typeof val !== 'object' || val === null) {
              if (__DEV__) {
                throw createError(`AUR0112: Cannot use non-object value for destructuring assignment.`);
              } else {
                throw createError(`AUR0112`);
              }
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
    case ExpressionKind.DestructuringAssignmentLeaf: {
      if (ast instanceof DestructuringAssignmentSingleExpression) {
        if (val == null) { return; }
        if (typeof val !== 'object') {
          if (__DEV__) {
            throw createError(`AUR0112: Cannot use non-object value for destructuring assignment.`);
          } else {
            throw createError(`AUR0112`);
          }
        }
        let source = astEvaluate(ast.source, Scope.create(val), e, null);
        if (source === void 0 && ast.initializer) {
          source = astEvaluate(ast.initializer, s, e, null);
        }
        astAssign(ast.target, s, e, source);
      } else {
        if (val == null) { return; }
        if (typeof val !== 'object') {
          if (__DEV__) {
            throw createError(`AUR0112: Cannot use non-object value for destructuring assignment.`);
          } else {
            throw createError(`AUR0112`);
          }
        }

        const indexOrProperties = ast.indexOrProperties;

        let restValue: Record<string, unknown> | unknown[];
        if (isArrayIndex(indexOrProperties)) {
          if (!Array.isArray(val)) {
            if (__DEV__) {
              throw createError(`AUR0112: Cannot use non-array value for array-destructuring assignment.`);
            } else {
              throw createError(`AUR0112`);
            }
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
    case ExpressionKind.Custom:
      return ast.assign(s, e, val);
    default:
      return void 0;
  }
}

type BindingWithBehavior = IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined };

export function astBind(ast: IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectableBinding) {
  switch (ast.$kind) {
    case ExpressionKind.BindingBehavior: {
      const name = ast.name;
      const key = ast.key;
      const behavior = b.getBehavior?.<BindingBehaviorInstance>(name);
      if (behavior == null) {
        throw behaviorNotFoundError(name);
      }
      if ((b as BindingWithBehavior)[key] === void 0) {
        (b as BindingWithBehavior)[key] = behavior;
        behavior.bind?.(s, b, ...ast.args.map(a => astEvaluate(a, s, b, null) as {}[]));
      } else {
        throw duplicateBehaviorAppliedError(name);
      }
      astBind(ast.expression, s, b);
      return;
    }
    case ExpressionKind.ValueConverter: {
      const name = ast.name;
      const vc = b.getConverter?.(name);
      if (vc == null) {
        throw converterNotFoundError(name);
      }
      // note: the cast is expected. To connect, it just needs to be a IConnectable
      // though to work with signal, it needs to have `handleChange`
      // so having `handleChange` as a guard in the connectable as a safe measure is needed
      // to make sure signaler works
      const signals = vc.signals;
      if (signals != null) {
        const signaler = b.get?.(ISignaler);
        const ii = signals.length;
        let i = 0;
        for (; i < ii; ++i) {
          // todo: signaler api
          signaler?.addSignalListener(signals[i], b);
        }
      }
      astBind(ast.expression, s, b);
      return;
    }
    case ExpressionKind.ForOfStatement: {
      astBind(ast.iterable, s, b);
      break;
    }
    case ExpressionKind.Custom: {
      ast.bind?.(s, b);
    }
  }
}

export function astUnbind(ast: IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectableBinding) {
  switch (ast.$kind) {
    case ExpressionKind.BindingBehavior: {
      const key = ast.key;
      const $b = b as BindingWithBehavior;
      if ($b[key] !== void 0) {
        $b[key]!.unbind?.(s, b);
        $b[key] = void 0;
      }
      astUnbind(ast.expression, s, b);
      break;
    }
    case ExpressionKind.ValueConverter: {
      const vc = b.getConverter?.(ast.name);
      if (vc?.signals === void 0) {
        return;
      }
      const signaler = b.get(ISignaler);
      let i = 0;
      for (; i < vc.signals.length; ++i) {
        // the cast is correct, as the value converter expression would only add
        // a IConnectable that also implements `ISubscriber` interface to the signaler
        signaler.removeSignalListener(vc.signals[i], b);
      }
      astUnbind(ast.expression, s, b);
      break;
    }
    case ExpressionKind.ForOfStatement: {
      astUnbind(ast.iterable, s, b);
      break;
    }
    case ExpressionKind.Custom: {
      ast.unbind?.(s, b);
    }
  }
}

const behaviorNotFoundError = (name: string) =>
  __DEV__
    ? createError(`AUR0101: BindingBehavior '${name}' could not be found. Did you forget to register it as a dependency?`)
    : createError(`AUR0101:${name}`);
const duplicateBehaviorAppliedError = (name: string) =>
  __DEV__
    ? createError(`AUR0102: BindingBehavior '${name}' already applied.`)
    : createError(`AUR0102:${name}`);
const converterNotFoundError = (name: string) => {
  if (__DEV__)
    return createError(`AUR0103: ValueConverter '${name}' could not be found. Did you forget to register it as a dependency?`);
  else
    return createError(`AUR0103:${name}`);
};

const getFunction = (mustEvaluate: boolean | undefined, obj: object, name: string): ((...args: unknown[]) => unknown) | null => {
  const func = obj == null ? null : (obj as IIndexable)[name];
  if (isFunction(func)) {
    return func as (...args: unknown[]) => unknown;
  }
  if (!mustEvaluate && func == null) {
    return null;
  }
  if (__DEV__)
    throw createError(`AUR0111: Expected '${name}' to be a function`);
  else
    throw createError(`AUR0111:${name}`);
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
