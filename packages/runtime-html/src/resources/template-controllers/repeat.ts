import {
  areEqual,
  isArray,
  isPromise,
  isMap,
  isSet,
  isNumber,
  type IDisposable,
  onResolve,
  type IIndexable,
  resolve,
  all,
  emptyArray,
  IContainer,
} from '@aurelia/kernel';
import {
  BindingBehaviorExpression,
  ForOfStatement,
  type IsBindingBehavior,
  ValueConverterExpression,
} from '@aurelia/expression-parser';
import {
  type Collection,
  CollectionObserver,
  getCollectionObserver,
  type IndexMap,
  createIndexMap,
  astEvaluate,
  astAssign,
  Scope,
  BindingContext,
  type IOverrideContext,
} from '@aurelia/runtime';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { IController } from '../../templating/controller';
import { rethrow, etIsProperty } from '../../utilities';
import { HydrateTemplateController, IInstruction, IteratorBindingInstruction } from '@aurelia/template-compiler';

import type { PropertyBinding } from '../../binding/property-binding';
import type { ISyntheticView, ICustomAttributeController, IHydratableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
import { ErrorNames, createMappedError } from '../../errors';
import { createInterface, singletonRegistration } from '../../utilities-di';

type Items<C extends Collection = unknown[]> = C | undefined;

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

const wrappedExprs = [
  'BindingBehavior',
  'ValueConverter',
];

export class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'repeat',
    isTemplateController: true,
    bindables: ['items'],
  };

  public views: ISyntheticView[] = [];
  public forOf!: ForOfStatement;
  public local!: string;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public items: Items<C>;
  public key: null | string | IsBindingBehavior = null;

  /** @internal */ private _oldViews: ISyntheticView[] = [];
  /** @internal */ private _scopes: Scope[] = [];
  /** @internal */ private _oldScopes: Scope[] = [];
  /** @internal */ private _scopeMap: Map<unknown, Scope | Scope[]> = new Map();
  /** @internal */ private _observer?: CollectionObserver = void 0;
  /** @internal */ private _innerItems: Items<C> | null;
  /** @internal */ private _forOfBinding!: PropertyBinding;
  /** @internal */ private _observingInnerItems: boolean = false;
  /** @internal */ private _reevaluating: boolean = false;
  /** @internal */ private _innerItemsExpression: IsBindingBehavior | null = null;
  /** @internal */ private _normalizedItems?: unknown[] = void 0;
  /** @internal */ private _hasDestructuredLocal: boolean = false;

  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _parent = resolve(IController) as IHydratableController;
  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _resolver = resolve(IRepeatableHandlerResolver);

  public constructor() {
    const instruction = resolve(IInstruction) as HydrateTemplateController;
    const keyProp = (instruction.props[0] as IteratorBindingInstruction).props[0];
    if (keyProp !== void 0) {
      const { to, value, command } = keyProp;
      if (to === 'key') {
        if (command === null) {
          this.key = value;
        } else if (command === 'bind') {
          this.key = resolve(IExpressionParser).parse(value, etIsProperty);
        } else {
          throw createMappedError(ErrorNames.repeat_invalid_key_binding_command, command);
        }
      } else {
        throw createMappedError(ErrorNames.repeat_extraneous_binding, to);
      }
    }
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    const bindings = this._parent.bindings as PropertyBinding[];
    const ii = bindings.length;
    let binding: PropertyBinding = (void 0)!;
    let forOf!: ForOfStatement;
    let i = 0;
    for (; ii > i; ++i) {
      binding = bindings[i];
      if (binding.target === this && binding.targetProperty === 'items') {
        forOf = this.forOf = binding.ast as ForOfStatement;
        this._forOfBinding = binding;

        let expression = forOf.iterable;
        while (expression != null && wrappedExprs.includes(expression.$kind)) {
          expression = (expression as ValueConverterExpression | BindingBehaviorExpression).expression;
          this._observingInnerItems = true;
        }
        this._innerItemsExpression = expression;

        break;
      }
    }

    this._refreshCollectionObserver();
    const dec = forOf.declaration;
    if(!(this._hasDestructuredLocal = dec.$kind === 'ArrayDestructuring' || dec.$kind === 'ObjectDestructuring')) {
      this.local = astEvaluate(dec, this.$controller.scope, binding, null) as string;
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._normalizeToArray();
    this._createScopes(void 0);

    return this._activateAllViews(initiator, this._normalizedItems ?? emptyArray);
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._refreshCollectionObserver();

    return this._deactivateAllViews(initiator);
  }

  public unbinding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._scopeMap.clear();
  }

  // called by SetterObserver
  public itemsChanged(): void {
    if (!this.$controller.isActive) {
      return;
    }
    this._refreshCollectionObserver();
    this._normalizeToArray();
    this._createScopes(void 0);
    this._applyIndexMap(void 0);
  }

  public handleCollectionChange(collection: Collection, indexMap: IndexMap | undefined): void {
    const $controller = this.$controller;
    if (!$controller.isActive) {
      return;
    }
    if (this._observingInnerItems) {
      if (this._reevaluating) {
        return;
      }
      this._reevaluating = true;
      this.items = astEvaluate(this.forOf.iterable, $controller.scope, this._forOfBinding, null) as Items<C>;
      this._reevaluating = false;
      return;
    }

    this._normalizeToArray();
    this._createScopes(this.key === null ? indexMap : void 0);
    this._applyIndexMap(indexMap);
  }

  /** @internal */
  private _applyIndexMap(indexMap: IndexMap | undefined): void {
    const oldViews = this.views;
    this._oldViews = oldViews.slice();
    const oldLen = oldViews.length;
    const key = this.key;
    const hasKey = key !== null;

    const oldScopes = this._oldScopes;
    const newScopes = this._scopes;

    if (hasKey || indexMap === void 0) {
      const local = this.local;
      const newItems = this._normalizedItems as IIndexable[];

      const newLen = newItems.length;
      const forOf = this.forOf;
      const dec = forOf.declaration;
      const binding = this._forOfBinding;
      const hasDestructuredLocal = this._hasDestructuredLocal;
      indexMap = createIndexMap(newLen);
      let i = 0;

      if (oldLen === 0) {
        // Only add new views
        for (; i < newLen; ++i) {
          indexMap[i] = -2;
        }
      } else if (newLen === 0) {
        // Only remove old views
        for (i = 0; i < oldLen; ++i) {
          indexMap.deletedIndices.push(i);
          indexMap.deletedItems.push(getItem(hasDestructuredLocal, dec, oldScopes[i], binding, local));
        }
      } else if (hasKey) {
        const oldKeys = Array<unknown>(oldLen);

        for (i = 0; i < oldLen; ++i) {
          oldKeys[i] = getKeyValue(hasDestructuredLocal, key, dec, oldScopes[i], binding, local);
        }

        const newKeys = Array<unknown>(oldLen);

        for (i = 0; i < newLen; ++i) {
          newKeys[i] = getKeyValue(hasDestructuredLocal, key, dec, newScopes[i], binding, local);
        }

        for (i = 0; i < newLen; ++i) {
          if (oldKeys.includes(newKeys[i])) {
            indexMap[i] = oldKeys.indexOf(newKeys[i]);
          } else {
            indexMap[i] = -2;
          }
        }

        for (i = 0; i < oldLen; ++i) {
          if (!newKeys.includes(oldKeys[i])) {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(getItem(hasDestructuredLocal, dec, oldScopes[i], binding, local));
          }
        }
      } else {
        for (i = 0; i < newLen; ++i) {
          if (oldScopes.includes(newScopes[i])) {
            indexMap[i] = oldScopes.indexOf(newScopes[i]);
          } else {
            indexMap[i] = -2;
          }
        }

        for (i = 0; i < oldLen; ++i) {
          if (!newScopes.includes(oldScopes[i])) {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(getItem(hasDestructuredLocal, dec, oldScopes[i], binding, local));
          }
        }
      }
    }

    // first detach+unbind+(remove from array) the deleted view indices
    if (indexMap.deletedIndices.length > 0) {
      const ret = onResolve(
        this._deactivateAndRemoveViewsByKey(indexMap),
        () => {
          // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
          return this._createAndActivateAndSortViewsByKey(indexMap);
        },
      );
      if (isPromise(ret)) { ret.catch(rethrow); }
    } else {
      // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._createAndActivateAndSortViewsByKey(indexMap);
    }
  }

  // todo: subscribe to collection from inner expression
  /** @internal */
  private _refreshCollectionObserver(): void {
    const scope = this.$controller.scope;

    let innerItems = this._innerItems;
    let observingInnerItems = this._observingInnerItems;
    let newObserver: CollectionObserver | undefined;

    if (observingInnerItems) {
      innerItems = this._innerItems = astEvaluate(this._innerItemsExpression!, scope, this._forOfBinding, null) as Items<C> ?? null;
      observingInnerItems = this._observingInnerItems = !areEqual(this.items, innerItems);
    }

    const oldObserver = this._observer;
    if (this.$controller.isActive) {
      const items = observingInnerItems ? innerItems : this.items;
      newObserver = this._observer = this._resolver.resolve(items).getObserver?.(items);
      if (oldObserver !== newObserver) {
        oldObserver?.unsubscribe(this);
        newObserver?.subscribe(this);
      }
    } else {
      oldObserver?.unsubscribe(this);
      this._observer = undefined;
    }
  }

  /** @internal */
  private _createScopes(indexMap: IndexMap | undefined): void {
    const oldScopes = this._scopes;
    this._oldScopes = oldScopes.slice();

    const items = this._normalizedItems!;
    const len = items.length;
    const scopes = this._scopes = Array(items.length);

    const oldScopeMap = this._scopeMap;
    const newScopeMap = new Map<unknown, Scope | Scope[]>();
    const parentScope = this.$controller.scope;
    const binding = this._forOfBinding;
    const forOf = this.forOf;
    const local = this.local;
    const hasDestructuredLocal = this._hasDestructuredLocal;

    if (indexMap === void 0) {
      const key = this.key;
      const hasKey = key !== null;
      if (hasKey) {
        const keys = Array<unknown>(len);
        if (typeof key === 'string') {
          for (let i = 0; i < len; ++i) {
            keys[i] = (items[i] as IIndexable)[key];
          }
        } else {
          for (let i = 0; i < len; ++i) {
            // This method of creating a throwaway scope just for key evaluation is inefficient but requires a lot less code this way.
            // It seems acceptable for what should be a niche use case and this way it's guaranteed to work correctly in all cases.
            // When performance matters, it is advised to use normal string-based keys instead of expressions:
            // `repeat.for="i of items; key.bind: i.key" - inefficient
            // `repeat.for="i of items; key: key" - efficient
            const scope = createScope(items[i], forOf, parentScope, binding, local, hasDestructuredLocal);
            setItem(hasDestructuredLocal, forOf.declaration, scope, binding, local, items[i]);
            keys[i] = astEvaluate(key, scope, binding, null);
          }
        }
        for (let i = 0; i < len; ++i) {
          scopes[i] = getScope(oldScopeMap, newScopeMap, keys[i], items[i], forOf, parentScope, binding, local, hasDestructuredLocal);
        }
      } else {
        for (let i = 0; i < len; ++i) {
          scopes[i] = getScope(oldScopeMap, newScopeMap, items[i], items[i], forOf, parentScope, binding, local, hasDestructuredLocal);
        }
      }
    } else {
      const oldLen = oldScopes.length;
      for (let i = 0; i < len; ++i) {
        const src = indexMap[i];

        if (src >= 0 && src < oldLen) {
          scopes[i] = oldScopes[src];
        } else {
          scopes[i] = createScope(items[i], forOf, parentScope, binding, local, hasDestructuredLocal);
        }
        setItem(hasDestructuredLocal, forOf.declaration, scopes[i], binding, local, items[i]);
      }
    }

    oldScopeMap.clear();
    this._scopeMap = newScopeMap;
  }

  /** @internal */
  private _normalizeToArray(): void {
    const items = this.items;
    if (isArray(items)) {
      this._normalizedItems = items.slice(0);
      return;
    }
    const normalizedItems: unknown[] = [];

    this._resolver.resolve(items).iterate(items, (item, index) => {
      normalizedItems[index] = item;
    });
    this._normalizedItems = normalizedItems;
  }

  /** @internal */
  private _activateAllViews(
    initiator: IHydratedController | null,
    $items: unknown[],
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let scope: Scope;

    const { $controller, _factory, _location, _scopes } = this;
    const newLen = $items.length;
    const views = this.views = Array(newLen);

    for (let i = 0; i < newLen; ++i) {
      view = views[i] = _factory.create().setLocation(_location);
      view.nodes.unlink();
      scope = _scopes[i];

      setContextualProperties(scope.overrideContext as RepeatOverrideContext, i, newLen);
      ret = view.activate(initiator ?? view, $controller, scope);
      if (isPromise(ret)) {
        (promises ??= []).push(ret);
      }
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  /** @internal */
  private _deactivateAllViews(
    initiator: IHydratedController | null,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let i = 0;

    const { views, $controller } = this;
    const ii = views.length;

    for (; ii > i; ++i) {
      view = views[i];
      view.release();
      ret = view.deactivate(initiator ?? view, $controller);
      if (isPromise(ret)) {
        (promises ?? (promises = [])).push(ret);
      }
    }

    if (promises !== void 0) {
      return (promises.length === 1
        ? promises[0]
        : Promise.all(promises)) as unknown as Promise<void>;
    }
  }

  /** @internal */
  private _deactivateAndRemoveViewsByKey(
    indexMap: IndexMap,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;

    const { $controller, views } = this;

    const deleted = indexMap.deletedIndices.slice().sort(compareNumber);
    const deletedLen = deleted.length;
    let i = 0;
    for (; deletedLen > i; ++i) {
      view = views[deleted[i]];
      view.release();
      ret = view.deactivate(view, $controller);
      if (isPromise(ret)) {
        (promises ?? (promises = [])).push(ret);
      }
    }

    i = 0;
    for (; deletedLen > i; ++i) {
      views.splice(deleted[i] - i, 1);
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  /** @internal */
  private _createAndActivateAndSortViewsByKey(
    indexMap: IndexMap,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let i = 0;

    const { $controller, _factory, _location, views, _scopes, _oldViews } = this;
    const newLen = indexMap.length;

    for (; newLen > i; ++i) {
      if (indexMap[i] === -2) {
        view = _factory.create();
        views.splice(i, 0, view);
      }
    }

    if (views.length !== newLen) {
      throw createMappedError(ErrorNames.repeat_mismatch_length, [views.length, newLen]);
    }

    let source = 0;
    i = 0;
    for (; i < indexMap.length; ++i) {
      if ((source = indexMap[i]) !== -2) {
        views[i] = _oldViews[source];
      }
    }

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;

    let next: ISyntheticView;
    let j = seqLen - 1;
    i = newLen - 1;
    for (; i >= 0; --i) {
      view = views[i];
      next = views[i + 1];

      if (indexMap[i] === -2) {
        view.nodes.link(next?.nodes ?? _location);
        view.setLocation(_location);
        setContextualProperties(_scopes[i].overrideContext as RepeatOverrideContext, i, newLen);
        ret = view.activate(view, $controller, _scopes[i]);
        if (isPromise(ret)) {
          (promises ?? (promises = [])).push(ret);
        }
      } else if (j < 0 || i !== seq[j]) {
        view.nodes.link(next?.nodes ?? _location);
        setContextualProperties(view.scope.overrideContext as RepeatOverrideContext, i, newLen);
        view.nodes.insertBefore(view.location!);
      } else {
        setContextualProperties(view.scope.overrideContext as RepeatOverrideContext, i, newLen);
        --j;
      }
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  public dispose(): void {
    this.views.forEach(dispose);
    this.views = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    const { views } = this;

    if (views !== void 0) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        if (views[i].accept(visitor) === true) {
          return true;
        }
      }
    }
  }
}

let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);

// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
export function longestIncreasingSubsequence(indexMap: IndexMap): Int32Array {
  const len = indexMap.length;

  if (len > maxLen) {
    maxLen = len;
    prevIndices = new Int32Array(len);
    tailIndices = new Int32Array(len);
  }

  let cursor = 0;
  let cur = 0;
  let prev = 0;
  let i = 0;
  let j = 0;
  let low = 0;
  let high = 0;
  let mid = 0;

  for (; i < len; i++) {
    cur = indexMap[i];
    if (cur !== -2) {
      j = prevIndices[cursor];

      prev = indexMap[j];
      if (prev !== -2 && prev < cur) {
        tailIndices[i] = j;
        prevIndices[++cursor] = i;
        continue;
      }

      low = 0;
      high = cursor;

      while (low < high) {
        mid = (low + high) >> 1;
        prev = indexMap[prevIndices[mid]];
        if (prev !== -2 && prev < cur) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      prev = indexMap[prevIndices[low]];
      if (cur < prev || prev === -2) {
        if (low > 0) {
          tailIndices[i] = prevIndices[low - 1];
        }
        prevIndices[low] = i;
      }
    }
  }
  i = ++cursor;
  const result = new Int32Array(i);
  cur = prevIndices[cursor - 1];

  while (cursor-- > 0) {
    result[cursor] = cur;
    cur = tailIndices[cur];
  }
  while (i-- > 0) prevIndices[i] = 0;
  return result;
}

interface IRepeatOverrideContext extends IOverrideContext {
  $index: number;
  $odd: boolean;
  $even: boolean;
  $first: boolean;
  $middle: boolean;
  $last: boolean;
  $length: number; // new in v2, there are a few requests, not sure if it should stay
}

class RepeatOverrideContext implements IRepeatOverrideContext {
  public get $odd(): boolean {
    return !this.$even;
  }
  public get $even(): boolean {
    return this.$index % 2 === 0;
  }
  public get $first(): boolean {
    return this.$index === 0;
  }
  public get $middle(): boolean {
    return !this.$first && !this.$last;
  }
  public get $last(): boolean {
    return this.$index === this.$length - 1;
  }

  public constructor(
    public readonly $index: number = 0,
    public readonly $length: number = 1,
  ) {}
}

const setContextualProperties = (oc: IRepeatOverrideContext, index: number, length: number): void => {
  oc.$index = index;
  oc.$length = length;
};

export const IRepeatableHandlerResolver = /*@__PURE__*/ createInterface<IRepeatableHandlerResolver>(
  'IRepeatableHandlerResolver',
  x => x.singleton(RepeatableHandlerResolver)
);
/**
 * An interface describings the capabilities of a repeatable handler.
 */
export interface IRepeatableHandlerResolver {
  resolve(value: unknown): IRepeatableHandler;
}

/**
 * The default implementation of the IRepeatableHandlerResolver interface
 */
class RepeatableHandlerResolver implements IRepeatableHandlerResolver {
  /** @internal */
  private readonly _handlers = resolve(all(IRepeatableHandler));

  public resolve(value: Repeatable): IRepeatableHandler {
    if (_arrayHandler.handles(value)) {
      return _arrayHandler;
    }
    if (_setHandler.handles(value)) {
      return _setHandler;
    }
    if (_mapHandler.handles(value)) {
      return _mapHandler;
    }
    if (_numberHandler.handles(value)) {
      return _numberHandler;
    }
    if (_nullishHandler.handles(value)) {
      return _nullishHandler;
    }
    const handler = this._handlers.find(x => x.handles(value));
    if (handler !== void 0) {
      return handler;
    }
    return _unknownHandler;
  }
}

/**
 * A simple implementation for handling common array like values, such as:
 * - HTMLCollection
 * - NodeList
 * - FileList,
 * - etc...
 */
export class ArrayLikeHandler implements IRepeatableHandler<ArrayLike<unknown>> {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IRepeatableHandler, this));
  }

  public handles(value: NonNullable<unknown>): boolean {
    return 'length' in value && isNumber(value.length);
  }

  public iterate(items: ArrayLike<unknown>, func: (item: unknown, index: number, arr: ArrayLike<unknown>) => void): void {
    for (let i = 0, ii = items.length; i < ii; ++i) {
      func(items[i], i, items);
    }
  }

}

/**
 * An interface describing a repeatable value handler
 */
export const IRepeatableHandler = /*@__PURE__*/ createInterface<IRepeatableHandler>('IRepeatableHandler');

export interface IRepeatableHandler<TValue extends Repeatable = Repeatable> {
  handles(value: unknown): boolean;
  getObserver?(value: TValue): CollectionObserver | undefined;
  iterate(value: TValue, func: (item: unknown, index: number, value: TValue) => void): void;
  // getCount(items: TValue): number;
}

const _arrayHandler: IRepeatableHandler<unknown[]> = {
  handles: isArray,
  getObserver: getCollectionObserver,
  /* istanbul ignore next */
  iterate(value, func): void {
    const ii = value.length;
    let i = 0;
    for (; i < ii; ++i) {
      func(value[i], i, value);
    }
  },
  // getCount: items => items.length,
};

const _setHandler: IRepeatableHandler<Set<unknown>> = {
  handles: isSet,
  getObserver: getCollectionObserver,
  iterate(value, func): void {
    let i = 0;
    let key: unknown;
    for (key of value.keys()) {
      func(key, i++, value);
    }
  },
  // getCount: s => s.size,
};

const _mapHandler: IRepeatableHandler<Map<unknown, unknown>> = {
  handles: isMap,
  getObserver: getCollectionObserver,
  iterate(value, func): void {
    let i = 0;
    let entry: [unknown, unknown] | undefined;
    for (entry of value.entries()) {
      func(entry, i++, value);
    }
  },
  // getCount: s => s.size,
};

const _numberHandler: IRepeatableHandler<number> = {
  handles: isNumber,
  iterate(value, func): void {
    let i = 0;
    for (; i < value; ++i) {
      func(i, i, value);
    }
  },
  // getCount: v => v,
};

const _nullishHandler: IRepeatableHandler<null | undefined> = {
  handles: v => v == null,
  iterate() {/* do nothing */},
  // getCount: () => 0,
};

const _unknownHandler: IRepeatableHandler = {
  handles(_value: unknown): boolean {
    // Should only return as an explicit last fallback
    return false;
  },
  iterate(value: Repeatable, _func: (item: unknown, index: number, value: Repeatable) => void): void {
    throw createMappedError(ErrorNames.repeat_non_iterable, value);
  },
  // getCount: () => 0,
};

type Repeatable = Collection | ArrayLike<unknown> | number | null | undefined;

const setItem = (
  hasDestructuredLocal: boolean,
  dec: ForOfStatement['declaration'],
  scope: Scope,
  binding: PropertyBinding,
  local: string,
  item: unknown,
) => {
  if (hasDestructuredLocal) {
    astAssign(dec, scope, binding, null, item);
  } else {
    scope.bindingContext[local] = item;
  }
};

const getItem = (
  hasDestructuredLocal: boolean,
  dec: ForOfStatement['declaration'],
  scope: Scope,
  binding: PropertyBinding,
  local: string,
): unknown => {
  return hasDestructuredLocal ? astEvaluate(dec, scope, binding, null) : scope.bindingContext[local];
};

const getKeyValue = (
  hasDestructuredLocal: boolean,
  key: string | IsBindingBehavior,
  dec: ForOfStatement['declaration'],
  scope: Scope,
  binding: PropertyBinding,
  local: string,
) => {
  if (typeof key === 'string') {
    const item = getItem(hasDestructuredLocal, dec, scope, binding, local);
    return (item as IIndexable)[key];
  }

  return astEvaluate(key, scope, binding, null);
};

const getScope = (
  oldScopeMap: Map<unknown, Scope | Scope[]>,
  newScopeMap: Map<unknown, Scope | Scope[]>,
  key: unknown,
  item: unknown,
  forOf: ForOfStatement,
  parentScope: Scope,
  binding: PropertyBinding,
  local: string,
  hasDestructuredLocal: boolean,
) => {
  let scope = oldScopeMap.get(key);
  if (scope === void 0) {
    scope = createScope(item, forOf, parentScope, binding, local, hasDestructuredLocal);
  } else if (scope instanceof Scope) {
    oldScopeMap.delete(key);
  } else if (scope.length === 1) {
    scope = scope[0];
    oldScopeMap.delete(key);
  } else {
    scope = scope.shift()!;
  }

  if (newScopeMap.has(key)) {
    const entry = newScopeMap.get(key)!;
    if (entry instanceof Scope) {
      newScopeMap.set(key, [entry, scope]);
    } else {
      entry.push(scope);
    }
  } else {
    newScopeMap.set(key, scope);
  }
  setItem(hasDestructuredLocal, forOf.declaration, scope, binding, local, item);
  return scope;
};

const createScope = (
  item: unknown,
  forOf: ForOfStatement,
  parentScope: Scope,
  binding: PropertyBinding,
  local: string,
  hasDestructuredLocal: boolean,
) => {
  if (hasDestructuredLocal) {
    const scope = Scope.fromParent(parentScope, new BindingContext(), new RepeatOverrideContext());
    astAssign(forOf.declaration, scope, binding, null, item);
  }
  return Scope.fromParent(parentScope, new BindingContext(local, item), new RepeatOverrideContext());
};

const compareNumber = (a: number, b: number): number => a - b;
