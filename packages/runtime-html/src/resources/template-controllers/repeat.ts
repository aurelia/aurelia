import { type IDisposable, onResolve, IIndexable } from '@aurelia/kernel';
import {
  applyMutationsToIndices,
  BindingBehaviorExpression,
  BindingContext,
  type Collection,
  CollectionObserver,
  DestructuringAssignmentExpression,
  ExpressionKind,
  ForOfStatement,
  getCollectionObserver,
  type IndexMap,
  type IOverrideContext,
  type IsBindingBehavior,
  Scope,
  synchronizeIndices,
  ValueConverterExpression,
  astEvaluate,
  astAssign,
  createIndexMap,
  IExpressionParser,
  ExpressionType,
} from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';
import { IController } from '../../templating/controller';
import { bindable } from '../../bindable';
import { createError, isArray, isPromise, rethrow } from '../../utilities';
import { HydrateTemplateController, IInstruction, IteratorBindingInstruction, MultiAttrInstruction } from '../../renderer';

import type { PropertyBinding } from '../../binding/property-binding';
import type { LifecycleFlags, ISyntheticView, ICustomAttributeController, IHydratableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';

type Items<C extends Collection = unknown[]> = C | undefined;

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

const wrappedExprs = [
  ExpressionKind.BindingBehavior,
  ExpressionKind.ValueConverter,
];

export class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
  /** @internal */ protected static inject = [IInstruction, IExpressionParser, IRenderLocation, IController, IViewFactory];

  public views: ISyntheticView[] = [];

  public forOf!: ForOfStatement;
  public local!: string;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public items: Items<C>;
  public key: null | string | IsBindingBehavior = null;

  /** @internal */ private readonly _keyMap: Map<IIndexable, unknown> = new Map();
  /** @internal */ private readonly _scopeMap: Map<IIndexable, Scope> = new Map();
  /** @internal */ private _observer?: CollectionObserver = void 0;
  /** @internal */ private _innerItems: Items<C> | null;
  /** @internal */ private _forOfBinding!: PropertyBinding;
  /** @internal */ private _observingInnerItems: boolean = false;
  /** @internal */ private _reevaluating: boolean = false;
  /** @internal */ private _innerItemsExpression: IsBindingBehavior | null = null;
  /** @internal */ private _normalizedItems?: unknown[] = void 0;
  /** @internal */ private _hasDestructuredLocal: boolean = false;

  /** @internal */ private readonly _location: IRenderLocation;
  /** @internal */ private readonly _parent: IHydratableController;
  /** @internal */ private readonly _factory: IViewFactory;

  public constructor(
    instruction: HydrateTemplateController,
    parser: IExpressionParser,
    location: IRenderLocation,
    parent: IHydratableController,
    factory: IViewFactory,
  ) {
    const keyProp = (instruction.props[0] as IteratorBindingInstruction).props[0] as MultiAttrInstruction | undefined;
    if (keyProp !== void 0) {
      const { to, value, command } = keyProp;
      if (to === 'key') {
        if (command === null) {
          this.key = value;
        } else if (command === 'bind') {
          this.key = parser.parse(value, ExpressionType.IsProperty);
        } else {
          if (__DEV__) {
            throw createError(`AUR775:invalid command ${command}`);
          } else {
            throw createError(`AUR775:${command}`);
          }
        }
      } else {
        if (__DEV__) {
          throw createError(`AUR776:invalid target ${to}`);
        } else {
          throw createError(`AUR776:${to}`);
        }
      }
    }
    this._location = location;
    this._parent = parent;
    this._factory = factory;
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
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
    if(!(this._hasDestructuredLocal = dec.$kind === ExpressionKind.ArrayDestructuring || dec.$kind === ExpressionKind.ObjectDestructuring)) {
      this.local = astEvaluate(dec, this.$controller.scope, binding, null) as string;
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    this._normalizeToArray();

    return this._activateAllViews(initiator);
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    this._refreshCollectionObserver();

    return this._deactivateAllViews(initiator);
  }

  public unbinding(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    this._scopeMap.clear();
    this._keyMap.clear();
  }

  // called by SetterObserver
  public itemsChanged(): void {
    if (!this.$controller.isActive) {
      return;
    }
    this._refreshCollectionObserver();
    this._normalizeToArray();
    this._applyIndexMap(this.items!, void 0);
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
    this._applyIndexMap(collection, indexMap);
  }

  /** @internal */
  private _applyIndexMap(collection: Collection, indexMap: IndexMap | undefined): void {
    const oldViews = this.views;
    const oldLen = oldViews.length;
    const key = this.key;
    const hasKey = key !== null;

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
        if (hasDestructuredLocal) {
          for (i = 0; i < oldLen; ++i) {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(astEvaluate(dec, oldViews[i].scope, binding, null) as IIndexable);
          }
        } else {
          for (i = 0; i < oldLen; ++i) {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(oldViews[i].scope.bindingContext[local]);
          }
        }
      } else {
        const oldItems = Array<IIndexable>(oldLen);

        if (hasDestructuredLocal) {
          for (i = 0; i < oldLen; ++i) {
            oldItems[i] = astEvaluate(dec, oldViews[i].scope, binding, null) as IIndexable;
          }
        } else {
          for (i = 0; i < oldLen; ++i) {
            oldItems[i] = oldViews[i].scope.bindingContext[local];
          }
        }

        let oldItem: IIndexable;
        let newItem: IIndexable;
        let oldKey: unknown;
        let newKey: unknown;
        let j = 0;
        const oldEnd = oldLen - 1;
        const newEnd = newLen - 1;

        const oldIndices = new Map<unknown, number>();
        const newIndices = new Map<unknown, number>();
        const keyMap = this._keyMap;
        const scopeMap = this._scopeMap;
        const parentScope = this.$controller.scope;

        i = 0;
        // Step 1: narrow down the loop range as much as possible by checking the start and end for key equality
        outer: {
          // views with same key at start
          // eslint-disable-next-line no-constant-condition
          while (true) {
            oldItem = oldItems[i];
            newItem = newItems[i];
            oldKey = hasKey
              ? getKeyValue(keyMap, key, oldItem, getScope(scopeMap, oldItems[i], forOf, parentScope, binding, local, hasDestructuredLocal), binding)
              : oldItem;
            newKey = hasKey
              ? getKeyValue(keyMap, key, newItem, getScope(scopeMap, newItems[i], forOf, parentScope, binding, local, hasDestructuredLocal), binding)
              : newItem;
            if (oldKey !== newKey) {
              keyMap.set(oldItem, oldKey);
              keyMap.set(newItem, newKey);
              break;
            }

            ++i;
            if (i > oldEnd || i > newEnd) {
              break outer;
            }
          }

          // TODO(perf): might be able to remove this condition with some offset magic?
          if (oldEnd !== newEnd) {
            break outer;
          }

          // views with same key at end
          j = newEnd;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            oldItem = oldItems[j];
            newItem = newItems[j];
            oldKey = hasKey
              ? getKeyValue(keyMap, key, oldItem, getScope(scopeMap, oldItem, forOf, parentScope, binding, local, hasDestructuredLocal), binding)
              : oldItem;
            newKey = hasKey
              ? getKeyValue(keyMap, key, newItem, getScope(scopeMap, newItem, forOf, parentScope, binding, local, hasDestructuredLocal), binding)
              : newItem;
            if (oldKey !== newKey) {
              keyMap.set(oldItem, oldKey);
              keyMap.set(newItem, newKey);
              break;
            }

            --j;
            if (i > j) {
              break outer;
            }
          }
        }

        // Step 2: map keys to indices and adjust the indexMap
        const oldStart = i;
        const newStart = i;

        for (i = newStart; i <= newEnd; ++i) {
          if (keyMap.has(newItem = newItems[i])) {
            newKey = keyMap.get(newItem);
          } else {
            newKey = hasKey
              ? getKeyValue(keyMap, key, newItem, getScope(scopeMap, newItem, forOf, parentScope, binding, local, hasDestructuredLocal), binding)
              : newItem;
            keyMap.set(newItem, newKey);
          }
          newIndices.set(newKey, i);
        }

        for (i = oldStart; i <= oldEnd; ++i) {
          if (keyMap.has(oldItem = oldItems[i])) {
            oldKey = keyMap.get(oldItem);
          } else {
            oldKey = hasKey
              ? getKeyValue(keyMap, key, oldItem, oldViews[i].scope, binding)
              : oldItem;
          }
          oldIndices.set(oldKey, i);

          if (newIndices.has(oldKey)) {
            indexMap[newIndices.get(oldKey)!] = i;
          } else {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(oldItem);
          }
        }

        for (i = newStart; i <= newEnd; ++i) {
          if (!oldIndices.has(keyMap.get(newItems[i]))) {
            indexMap[i] = -2;
          }
        }

        oldIndices.clear();
        newIndices.clear();
      }
    }

    if (indexMap === void 0) {
      const ret = onResolve(
        this._deactivateAllViews(null),
        () => {
          // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
          return this._activateAllViews(null);
        },
      );
      if (isPromise(ret)) { ret.catch(rethrow); }
    } else {
      const $indexMap = applyMutationsToIndices(indexMap);
      // first detach+unbind+(remove from array) the deleted view indices
      if ($indexMap.deletedIndices.length > 0) {
        const ret = onResolve(
          this._deactivateAndRemoveViewsByKey($indexMap),
          () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this._createAndActivateAndSortViewsByKey(oldLen, $indexMap);
          },
        );
        if (isPromise(ret)) { ret.catch(rethrow); }
      } else {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._createAndActivateAndSortViewsByKey(oldLen, $indexMap);
      }
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
      observingInnerItems = this._observingInnerItems = !Object.is(this.items, innerItems);
    }

    const oldObserver = this._observer;
    if (this.$controller.isActive) {
      newObserver = this._observer = getCollectionObserver(observingInnerItems ? innerItems : this.items);
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
  private _normalizeToArray(): void {
    const { items } = this;
    if (isArray(items)) {
      this._normalizedItems = items;
      return;
    }
    const normalizedItems: unknown[] = [];

    iterate(items, (item, index) => {
      normalizedItems[index] = item;
    });
    this._normalizedItems = normalizedItems;
  }

  /** @internal */
  private _activateAllViews(
    initiator: IHydratedController | null,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let viewScope: Scope;

    const { $controller, _factory, local, _location, items, _scopeMap, _forOfBinding, forOf, _hasDestructuredLocal } = this;
    const parentScope = $controller.scope;
    const newLen = getCount(items);
    const views = this.views = Array(newLen);

    iterate(items, (item, i) => {
      view = views[i] = _factory.create().setLocation(_location);
      view.nodes.unlink();
      viewScope = getScope(_scopeMap, item as IIndexable, forOf, parentScope, _forOfBinding, local, _hasDestructuredLocal);
      setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);

      ret = view.activate(initiator ?? view, $controller, 0, viewScope);
      if (isPromise(ret)) {
        (promises ?? (promises = [])).push(ret);
      }
    });

    if (promises !== void 0) {
      return (promises as Promise<void>[]).length === 1
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
      ret = view.deactivate(initiator ?? view, $controller, 0);
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

    const deleted = indexMap.deletedIndices;
    const deletedLen = deleted.length;
    let i = 0;
    for (; deletedLen > i; ++i) {
      view = views[deleted[i]];
      view.release();
      ret = view.deactivate(view, $controller, 0);
      if (isPromise(ret)) {
        (promises ?? (promises = [])).push(ret);
      }
    }

    i = 0;
    let j = 0;
    for (; deletedLen > i; ++i) {
      j = deleted[i] - i;
      views.splice(j, 1);
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  /** @internal */
  private _createAndActivateAndSortViewsByKey(
    oldLength: number,
    indexMap: IndexMap,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let viewScope: Scope;
    let i = 0;

    const { $controller, _factory, local, _normalizedItems, _location, views, _hasDestructuredLocal, _forOfBinding, _scopeMap, forOf } = this;
    const mapLen = indexMap.length;

    for (; mapLen > i; ++i) {
      if (indexMap[i] === -2) {
        view = _factory.create();
        views.splice(i, 0, view);
      }
    }

    if (views.length !== mapLen) {
      throw mismatchedLengthError(views.length, mapLen);
    }

    const parentScope = $controller.scope;
    const newLen = indexMap.length;
    synchronizeIndices(views, indexMap);

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;

    const dec = forOf.declaration as DestructuringAssignmentExpression;
    let next: ISyntheticView;
    let j = seqLen - 1;
    i = newLen - 1;
    for (; i >= 0; --i) {
      view = views[i];
      next = views[i + 1];

      view.nodes.link(next?.nodes ?? _location);

      if (indexMap[i] === -2) {
        viewScope = getScope(_scopeMap, _normalizedItems![i] as IIndexable, forOf, parentScope, _forOfBinding, local, _hasDestructuredLocal);
        setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.setLocation(_location);

        ret = view.activate(view, $controller, 0, viewScope);
        if (isPromise(ret)) {
          (promises ?? (promises = [])).push(ret);
        }
      } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
        if (_hasDestructuredLocal) {
          astAssign(dec, view.scope, _forOfBinding, _normalizedItems![i]);
        } else {
          view.scope.bindingContext[local] = _normalizedItems![i];
        }
        setContextualProperties(view.scope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.nodes.insertBefore(view.location!);
      } else {
        if (_hasDestructuredLocal) {
          astAssign(dec, view.scope, _forOfBinding, _normalizedItems![i]);
        } else {
          view.scope.bindingContext[local] = _normalizedItems![i];
        }
        if (oldLength !== newLen) {
          setContextualProperties(view.scope.overrideContext as IRepeatOverrideContext, i, newLen);
        }
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
templateController('repeat')(Repeat);

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

const mismatchedLengthError = (viewCount: number, itemCount: number) =>
  __DEV__
    ? createError(`AUR0814: viewsLen=${viewCount}, mapLen=${itemCount}`)
    : createError(`AUR0814:${viewCount}!=${itemCount}`);
const setContextualProperties = (oc: IRepeatOverrideContext, index: number, length: number): void => {
  const isFirst = index === 0;
  const isLast = index === length - 1;
  const isEven = index % 2 === 0;
  oc.$index = index;
  oc.$first = isFirst;
  oc.$last = isLast;
  oc.$middle = !isFirst && !isLast;
  oc.$even = isEven;
  oc.$odd = !isEven;
  oc.$length = length;
};

const toStringTag = Object.prototype.toString as {
  call(obj: unknown): keyof '[object Array]' | '[object Map]' | '[object Set]' | '[object Number]' | '[object Null]' | '[object Undefined]';
};
type AcceptableCollection = Collection | number | null | undefined;
const getCount = (result: AcceptableCollection): number => {
  switch (toStringTag.call(result) as string) {
    case '[object Array]': return (result as unknown[]).length;
    case '[object Map]': return (result as Map<unknown, unknown>).size;
    case '[object Set]': return (result as Set<unknown>).size;
    case '[object Number]': return result as number;
    case '[object Null]': return 0;
    case '[object Undefined]': return 0;
    // todo: remove this count method
    default: throw createError(`Cannot count ${toStringTag.call(result) as string}`);
  }
};

const iterate = (result: AcceptableCollection, func: (item: unknown, index: number, arr: AcceptableCollection) => void): void => {
  switch (toStringTag.call(result) as string) {
    case '[object Array]': return $array(result as unknown[], func);
    case '[object Map]': return $map(result as Map<unknown, unknown>, func);
    case '[object Set]': return $set(result as Set<unknown>, func);
    case '[object Number]': return $number(result as number, func);
    case '[object Null]': return;
    case '[object Undefined]': return;
    // todo: remove this count method
    default: throw createError(`Cannot iterate over ${toStringTag.call(result) as string}`);
  }
};

const $array = (result: unknown[], func: (item: unknown, index: number, arr: Collection) => void): void => {
  const ii = result.length;
  let i = 0;
  for (; i < ii; ++i) {
    func(result[i], i, result);
  }
};

const $map = (result: Map<unknown, unknown>, func: (item: unknown, index: number, arr: Collection) => void): void => {
  let i = -0;
  let entry: [unknown, unknown] | undefined;
  for (entry of result.entries()) {
    func(entry, i++, result);
  }
};

const $set = (result: Set<unknown>, func: (item: unknown, index: number, arr: Collection) => void): void => {
  let i = 0;
  let key: unknown;
  for (key of result.keys()) {
    func(key, i++, result);
  }
};

const $number = (result: number, func: (item: number, index: number, arr: number) => void): void => {
  let i = 0;
  for (; i < result; ++i) {
    func(i, i, result);
  }
};

const getKeyValue = (
  keyMap: WeakMap<IIndexable, unknown>,
  key: string | IsBindingBehavior,
  item: IIndexable,
  scope: Scope,
  binding: PropertyBinding,
) => {

  let value = keyMap.get(item);
  if (value === void 0) {
    if (typeof key === 'string') {
      value = item[key];
    } else {
      value = astEvaluate(key, scope, binding, null);
    }
    keyMap.set(item, value);
  }
  return value;
};

const getScope = (
  scopeMap: WeakMap<IIndexable, Scope>,
  item: IIndexable,
  forOf: ForOfStatement,
  parentScope: Scope,
  binding: PropertyBinding,
  local: string,
  hasDestructuredLocal: boolean,
) => {
  let scope = scopeMap.get(item);
  if (scope === void 0) {
    if (hasDestructuredLocal) {
      astAssign(forOf.declaration as DestructuringAssignmentExpression, scope = Scope.fromParent(parentScope, new BindingContext()), binding, item);
    } else {
      scope = Scope.fromParent(parentScope, new BindingContext(local, item));
    }
    scopeMap.set(item, scope);
  }
  return scope;
};
