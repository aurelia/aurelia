import { nextId, IDisposable, onResolve } from '@aurelia/kernel';
import {
  applyMutationsToIndices,
  BindingBehaviorExpression,
  BindingContext,
  Collection,
  CollectionObserver,
  DestructuringAssignmentExpression,
  ExpressionKind,
  ForOfStatement,
  getCollectionObserver,
  IndexMap,
  IOverrideContext,
  IsBindingBehavior,
  LifecycleFlags as LF,
  Scope,
  synchronizeIndices,
  ValueConverterExpression,
} from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';
import { IController } from '../../templating/controller';
import { bindable } from '../../bindable';
import { isPromise, rethrow } from '../../utilities';

import type { PropertyBinding } from '../../binding/property-binding';
import type { ISyntheticView, ICustomAttributeController, IHydratableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';

type Items<C extends Collection = unknown[]> = C | undefined;

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

const wrappedExprs = [
  ExpressionKind.BindingBehavior,
  ExpressionKind.ValueConverter,
];

export class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
  /** @internal */ protected static inject = [IRenderLocation, IController, IViewFactory];
  public readonly id: number = nextId('au$component');

  public views: ISyntheticView[] = [];
  public key?: string = void 0;

  public forOf!: ForOfStatement;
  public local!: string;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public items: Items<C>;

  /** @internal */ private _observer?: CollectionObserver = void 0;
  /** @internal */ private _innerItems: Items<C> | null;
  /** @internal */ private _forOfBinding!: PropertyBinding;
  /** @internal */ private _observingInnerItems: boolean = false;
  /** @internal */ private _reevaluating: boolean = false;
  /** @internal */ private _innerItemsExpression: IsBindingBehavior | null = null;
  /** @internal */ private _normalizedItems?: unknown[] = void 0;
  /** @internal */ private _hasDestructuredLocal: boolean = false;

  public constructor(
    /** @internal */ private readonly _location: IRenderLocation,
    /** @internal */ private readonly _parent: IHydratableController,
    /** @internal */ private readonly _factory: IViewFactory
  ) {}

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LF,
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
      this.local = dec.evaluate(this.$controller.scope, binding, null) as string;
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LF,
  ): void | Promise<void> {
    this._normalizeToArray();

    return this._activateAllViews(initiator);
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LF,
  ): void | Promise<void> {
    this._refreshCollectionObserver();

    return this._deactivateAllViews(initiator);
  }

  // called by SetterObserver
  public itemsChanged(): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    this._refreshCollectionObserver();
    this._normalizeToArray();

    const ret = onResolve(
      this._deactivateAllViews(null),
      () => {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
        return this._activateAllViews(null);
      },
    );
    if (isPromise(ret)) { ret.catch(rethrow); }
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
      this.items = this.forOf.iterable.evaluate($controller.scope, this._forOfBinding, null) as Items<C>;
      this._reevaluating = false;
      return;
    }

    this._normalizeToArray();

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
      const oldLength = this.views.length;
      const $indexMap = applyMutationsToIndices(indexMap);
      // first detach+unbind+(remove from array) the deleted view indices
      if ($indexMap.deletedIndices.length > 0) {
        const ret = onResolve(
          this._deactivateAndRemoveViewsByKey($indexMap),
          () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this._createAndActivateAndSortViewsByKey(oldLength, $indexMap);
          },
        );
        if (isPromise(ret)) { ret.catch(rethrow); }
      } else {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._createAndActivateAndSortViewsByKey(oldLength, $indexMap);
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
      innerItems = this._innerItems = this._innerItemsExpression!.evaluate(scope, this._forOfBinding, null) as Items<C> ?? null;
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
    const items: Items<C> = this.items;
    if (items instanceof Array) {
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

    const { $controller, _factory: factory, local, _location: location, items } = this;
    const parentScope = $controller.scope;
    const forOf = this.forOf;
    const newLen = getCount(items);
    const views = this.views = Array(newLen);

    iterate(items, (item, i) => {
      view = views[i] = factory.create().setLocation(location);
      view.nodes.unlink();
      if(this._hasDestructuredLocal) {
        (forOf.declaration as DestructuringAssignmentExpression)!.assign(viewScope = Scope.fromParent(parentScope, new BindingContext()), this._forOfBinding, item);
      } else {
        viewScope = Scope.fromParent(parentScope, new BindingContext(local, item));
      }
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

    const { $controller, _factory: factory, local, _normalizedItems: normalizedItems, _location: location, views } = this;
    const mapLen = indexMap.length;

    for (; mapLen > i; ++i) {
      if (indexMap[i] === -2) {
        view = factory.create();
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

    let next: ISyntheticView;
    let j = seqLen - 1;
    i = newLen - 1;
    for (; i >= 0; --i) {
      view = views[i];
      next = views[i + 1];

      view.nodes.link(next?.nodes ?? location);

      if (indexMap[i] === -2) {
        if(this._hasDestructuredLocal) {
          (this.forOf.declaration as DestructuringAssignmentExpression)!.assign(viewScope = Scope.fromParent(parentScope, new BindingContext()), this._forOfBinding, normalizedItems![i]);
        } else {
          viewScope = Scope.fromParent(parentScope, new BindingContext(local, normalizedItems![i]));
        }
        setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.setLocation(location);

        ret = view.activate(view, $controller, 0, viewScope);
        if (isPromise(ret)) {
          (promises ?? (promises = [])).push(ret);
        }
      } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
        setContextualProperties(view.scope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.nodes.insertBefore(view.location!);
      } else {
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
    ? new Error(`AUR0814: viewsLen=${viewCount}, mapLen=${itemCount}`)
    : new Error(`AUR0814:${viewCount}!=${itemCount}`);
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
    default: throw new Error(`Cannot count ${toStringTag.call(result) as string}`);
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
    default: throw new Error(`Cannot iterate over ${toStringTag.call(result) as string}`);
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
  let entry: [unknown, unknown];
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

