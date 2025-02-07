/* eslint-disable no-fallthrough */
import {
  CustomExpression,
  DestructuringAssignmentSingleExpression,
  type DestructuringAssignmentExpression,
  type DestructuringAssignmentRestExpression,
  type IsExpressionOrStatement,
} from '@aurelia/expression-parser';
import { type AnyFunction, type IIndexable, isArrayIndex, isArray, isFunction, isObjectOrFunction, Constructable } from '@aurelia/kernel';
import { type IConnectable, type IObservable } from './interfaces';
import { Scope, type IBindingContext, type IOverrideContext } from './scope';
import { ErrorNames, createMappedError } from './errors';
import { rtSafeString as safeString } from './utilities';

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
  /**
   * bind a behavior by the given name
   */
  bindBehavior?(name: string, scope: Scope, args: unknown[]): void;
  /**
   * unbind a behavior by the given name
   */
  unbindBehavior?(name: string, scope: Scope): void;
  /**
   * bind a converter by the given name
   */
  bindConverter?(name: string): void;
  /**
   * unbind a converter by the given name
   */
  unbindConverter?(name: string): void;
  /**
   * use a converter to convert a value
   */
  useConverter?(name: string, mode: 'toView' | 'fromView', value: unknown, args: unknown[]): unknown;
}

export const {
  astAssign,
  astEvaluate,
  astBind,
  astUnbind
} = /*@__PURE__*/(() => {
  const ekAccessThis = 'AccessThis';
  const ekAccessBoundary = 'AccessBoundary';
  const ekAccessGlobal = 'AccessGlobal';
  const ekAccessScope = 'AccessScope';
  const ekArrayLiteral = 'ArrayLiteral';
  const ekObjectLiteral = 'ObjectLiteral';
  const ekPrimitiveLiteral = 'PrimitiveLiteral';
  const ekNew = 'New';
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

  // eslint-disable-next-line max-lines-per-function
  function astEvaluate(ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
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
        if (evaluatedValue == null) {
          if (ast.name === '$host') {
            throw createMappedError(ErrorNames.ast_$host_not_found);
          }
          return evaluatedValue;
        }
        return e?.boundFn && isFunction(evaluatedValue)
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
        /* istanbul ignore next */
        if (!e?.strict && func == null) {
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
      case ekNew: {
        const func = astEvaluate(ast.func, s, e, c);
        if (isFunction(func)) {
          return new (func as Constructable)(...ast.args.map(a => astEvaluate(a, s, e, c)));
        }
        throw createMappedError(ErrorNames.ast_not_a_function);
      }
      case ekTemplate: {
        let result = ast.cooked[0];
        for (let i = 0; i < ast.expressions.length; ++i) {
          result += safeString(astEvaluate(ast.expressions[i], s, e, c));
          result += ast.cooked[i + 1];
        }
        return result;
      }
      case ekUnary: {
        const value = astEvaluate(ast.expression, s, e, c) ;
        switch (ast.operation as string) {
          case 'void':
            return void value;
          case 'typeof':
            return typeof value;
          case '!':
            return !(value as boolean);
          case '-':
            return -(value as number);
          case '+':
            return +(value as number);
          case '--':
            if (c != null) throw createMappedError(ErrorNames.ast_increment_infinite_loop);
            return (astAssign(ast.expression, s, e, c, (value as number) - 1) as number) + ast.pos;
          case '++':
            if (c != null) throw createMappedError(ErrorNames.ast_increment_infinite_loop);
            return (astAssign(ast.expression, s, e, c, (value as number) + 1) as number) - ast.pos;
          default:
            throw createMappedError(ErrorNames.ast_unknown_unary_operator, ast.operation);
        }
      }
      case ekCallScope: {
        const context = getContext(s, ast.name, ast.ancestor)!;
        if (context == null) {
          if (e?.strict) {
            throw createMappedError(ErrorNames.ast_nullish_member_access, ast.name, context);
          }
          return void 0;
        }
        const fn: unknown = context[ast.name];
        if (isFunction(fn)) {
          return fn.apply(context, ast.args.map(a => astEvaluate(a, s, e, c)));
        }
        if (fn == null) {
          if (e?.strict && !ast.optional) {
            throw createMappedError(ErrorNames.ast_name_is_not_a_function, ast.name);
          }
          return void 0;
        }
        throw createMappedError(ErrorNames.ast_name_is_not_a_function, ast.name);
      }
      case ekCallMember: {
        const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
        if (instance == null) {
          if (e?.strict && !ast.optionalMember) {
            throw createMappedError(ErrorNames.ast_nullish_member_access, ast.name, instance);
          }
        }
        const fn = instance?.[ast.name];
        if (fn == null) {
          if (!ast.optionalCall && e?.strict) {
            throw createMappedError(ErrorNames.ast_name_is_not_a_function, ast.name);
          }
          return void 0;
        }
        if (!isFunction(fn)) {
          throw createMappedError(ErrorNames.ast_name_is_not_a_function, ast.name);
        }
        const ret = fn.apply(instance, ast.args.map(a => astEvaluate(a, s, e, c)));
        if (isArray(instance) && autoObserveArrayMethods.includes(ast.name)) {
          c?.observeCollection(instance);
        }
        return ret;
      }
      case ekCallFunction: {
        const func = astEvaluate(ast.func, s, e, c);
        if (isFunction(func)) {
          return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
        }
        if (func == null) {
          if (!ast.optional && e?.strict) {
            throw createMappedError(ErrorNames.ast_not_a_function);
          }
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
        const instance = astEvaluate(ast.object, s, e, c) as IIndexable | null;
        if (instance == null) {
          if (!ast.optional && e?.strict) {
            throw createMappedError(ErrorNames.ast_nullish_member_access, ast.name, instance);
          }
          return void 0;
        }

        if (c !== null && !ast.accessGlobal) {
          c.observe(instance, ast.name);
        }
        const ret = instance[ast.name];
        return e?.boundFn && isFunction(ret)
          // event listener wants the returned function to be bound to the instance
          ? ret.bind(instance)
          : ret;
      }
      case ekAccessKeyed: {
        const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
        const key = astEvaluate(ast.key, s, e, c) as string;

        if (instance == null) {
          if (!ast.optional && e?.strict) {
            throw createMappedError(ErrorNames.ast_nullish_keyed_access, key, instance);
          }
          return void 0;
        }

        if (c !== null && !ast.accessGlobal) {
          c.observe(instance, key);
        }

        return instance[key];
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
            if (isObjectOrFunction($right)) {
              return astEvaluate(left, s, e, c) as string in $right;
            }
            return false;
          }
          case '+':
            return (astEvaluate(left, s, e, c) as number) + (astEvaluate(right, s, e, c) as number);
          case '-':
            return (astEvaluate(left, s, e, c) as number) - (astEvaluate(right, s, e, c) as number);
          case '*':
            return (astEvaluate(left, s, e, c) as number) * (astEvaluate(right, s, e, c) as number);
          case '/':
            return (astEvaluate(left, s, e, c) as number) / (astEvaluate(right, s, e, c) as number);
          case '%':
            return (astEvaluate(left, s, e, c) as number) % (astEvaluate(right, s, e, c) as number);
          case '**':
            return (astEvaluate(left, s, e, c) as number) ** (astEvaluate(right, s, e, c) as number);
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
      case ekAssign: {
        let value = astEvaluate(ast.value, s, e, c) as number;
        if (ast.op !== '=') {
          if (c != null) {
            throw createMappedError(ErrorNames.ast_increment_infinite_loop);
          }
          const target = (astEvaluate(ast.target, s, e, c) as number);
          switch (ast.op) {
            case '/=':
              value = target / value;
              break;
            case '*=':
              value = target * value;
              break;
            case '+=':
              value = target + value;
              break;
            case '-=':
              value = target - value;
              break;
            default:
              throw createMappedError(ErrorNames.ast_unknown_binary_operator, ast.op);
          }
        }
        return astAssign(ast.target, s, e, c, value);
      }
      case ekValueConverter: {
        return e?.useConverter?.(ast.name, 'toView', astEvaluate(ast.expression, s, e, c), ast.args.map(a => astEvaluate(a, s, e, c)));
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

  function astAssign(ast: CustomExpression | IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null, val: unknown): unknown {
    switch (ast.$kind) {
      case ekAccessScope: {
        if (ast.name === '$host') {
          throw createMappedError(ErrorNames.ast_no_assign_$host);
        }
        const obj = getContext(s, ast.name, ast.ancestor) as IObservable;
        return obj[ast.name] = val;
      }
      case ekAccessMember: {
        const obj = astEvaluate(ast.object, s, e, c) as IObservable;
        if (obj == null) {
          if (e?.strict) {
            // if ast optional and the optional assignment proposal goes ahead
            // we can allow this to be a no-op instead of throwing (check via ast.optional)
            // https://github.com/tc39/proposal-optional-chaining-assignment
            throw createMappedError(ErrorNames.ast_nullish_assignment, ast.name);
          }
          // creating an object and assign it to the owning property of the ast
          // this is a good enough behavior, and it works well in v1
          astAssign(ast.object, s, e, c, { [ast.name]: val });
        } else if (isObjectOrFunction(obj)) {
          if (ast.name === 'length' && isArray(obj) && !isNaN(val as number)) {
            obj.splice(val as number);
          } else {
            obj[ast.name] = val;
          }
        } else {
          // obj is a primitive, assigning a value to a property on a primitive
          // does nothing
        }
        return val;
      }
      case ekAccessKeyed: {
        const instance = astEvaluate(ast.object, s, e, c) as IIndexable;
        const key = astEvaluate(ast.key, s, e, c) as string;
        if (instance == null) {
          if (e?.strict) {
            // if ast optional and the optional assignment proposal goes ahead
            // we can allow this to be a no-op instead of throwing (check via ast.optional)
            // https://github.com/tc39/proposal-optional-chaining-assignment
            throw createMappedError(ErrorNames.ast_nullish_assignment, key);
          }
          // creating an object and assign it to the owning property of the ast
          // this is a good enough behavior, and it works well in v1
          astAssign(ast.object, s, e, c, { [key]: val });
          return val;
        }

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
        astAssign(ast.value, s, e, c, val);
        return astAssign(ast.target, s, e, c, val);
      case ekValueConverter: {
        val = e?.useConverter?.(ast.name, 'fromView', val, ast.args.map(a => astEvaluate(a, s, e, c)));
        return astAssign(ast.expression, s, e, c, val);
      }
      case ekBindingBehavior:
        return astAssign(ast.expression, s, e, c, val);
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
              astAssign(item, s, e, c, val);
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
              astAssign(item, s, e, c, source);
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
          let source = astEvaluate(ast.source, Scope.create(val), e, c);
          if (source === void 0 && ast.initializer) {
            source = astEvaluate(ast.initializer, s, e, c);
          }
          astAssign(ast.target, s, e, c, source);
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
          astAssign(ast.target, s, e, c, restValue);
        }
        break;
      }
      case ekCustom:
        return ast.assign(s, e, val);
      default:
        return void 0;
    }
  }

  function astBind(ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator) {
    switch (ast.$kind) {
      case ekBindingBehavior: {
        b.bindBehavior?.(ast.name, s, ast.args.map(a => astEvaluate(a, s, b, null)));
        astBind(ast.expression, s, b);
        break;
      }
      case ekValueConverter: {
        b.bindConverter?.(ast.name);
        astBind(ast.expression, s, b);
        break;
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

  function astUnbind(ast: CustomExpression | IsExpressionOrStatement, s: Scope, b: IAstEvaluator) {
    switch (ast.$kind) {
      case ekBindingBehavior: {
        b.unbindBehavior?.(ast.name, s);
        astUnbind(ast.expression, s, b);
        break;
      }
      case ekValueConverter: {
        b.unbindConverter?.(ast.name);
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

  return {
    astEvaluate,
    astAssign,
    astBind,
    astUnbind,
  };
})();
