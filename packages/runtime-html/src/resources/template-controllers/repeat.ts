import { compareNumber, nextId, IDisposable, onResolve } from '@aurelia/kernel';
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
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LF,
  ): void | Promise<void> {
    const bindings = this._parent.bindings as PropertyBinding[];
    const ii = bindings.length;
    let binding: PropertyBinding = (void 0)!;
    let forOf!: ForOfStatement;
    let i = 0;
    for (; ii > i; ++i) {
      binding = bindings[i];
      if (binding.target === this && binding.targetProperty === 'items') {
        forOf = this.forOf = binding.sourceExpression as ForOfStatement;
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

    this._refreshCollectionObserver(flags);
    const dec = forOf.declaration;
    if(!(this._hasDestructuredLocal = dec.$kind === ExpressionKind.ArrayDestructuring || dec.$kind === ExpressionKind.ObjectDestructuring)) {
      this.local = dec.evaluate(this.$controller.scope, binding.locator, null) as string;
    }
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LF,
  ): void | Promise<void> {
    this._normalizeToArray(flags);

    return this._activateAllViews(initiator, flags);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LF,
  ): void | Promise<void> {
    this._refreshCollectionObserver(flags);

    return this._deactivateAllViews(initiator, flags);
  }

  // called by SetterObserver
  public itemsChanged(flags: LF): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    flags |= $controller.flags;
    this._refreshCollectionObserver(flags);
    this._normalizeToArray(flags);

    const ret = onResolve(
      this._deactivateAllViews(null, flags),
      () => {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
        return this._activateAllViews(null, flags);
      },
    );
    if (isPromise(ret)) { ret.catch(rethrow); }
  }

  // called by a CollectionObserver
  public handleCollectionChange(
    indexMap: IndexMap | undefined,
    flags: LF,
  ): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    if (this._observingInnerItems) {
      if (this._reevaluating) {
        return;
      }
      this._reevaluating = true;
      this.items = this.forOf.iterable.evaluate($controller.scope, this._forOfBinding.locator, null) as Items<C>;
      this._reevaluating = false;
      return;
    }

    flags |= $controller.flags;
    this._normalizeToArray(flags);

    if (indexMap === void 0) {
      const ret = onResolve(
        this._deactivateAllViews(null, flags),
        () => {
          // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
          return this._activateAllViews(null, flags);
        },
      );
      if (isPromise(ret)) { ret.catch(rethrow); }
    } else {
      const oldLength = this.views.length;
      const $indexMap = applyMutationsToIndices(indexMap);
      // first detach+unbind+(remove from array) the deleted view indices
      if ($indexMap.deletedItems.length > 0) {
        $indexMap.deletedItems.sort(compareNumber);
        const ret = onResolve(
          this._deactivateAndRemoveViewsByKey($indexMap, flags),
          () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this._createAndActivateAndSortViewsByKey(oldLength, $indexMap, flags);
          },
        );
        if (isPromise(ret)) { ret.catch(rethrow); }
      } else {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._createAndActivateAndSortViewsByKey(oldLength, $indexMap, flags);
      }
    }
  }

  // todo: subscribe to collection from inner expression
  /** @internal */
  private _refreshCollectionObserver(_flags: LF): void {
    const scope = this.$controller.scope;

    let innerItems = this._innerItems;
    let observingInnerItems = this._observingInnerItems;
    let newObserver: CollectionObserver | undefined;

    if (observingInnerItems) {
      innerItems = this._innerItems = this._innerItemsExpression!.evaluate(scope, this._forOfBinding.locator, null) as Items<C> ?? null;
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
  private _normalizeToArray(flags: LF): void {
    const items: Items<C> = this.items;
    if (items instanceof Array) {
      this._normalizedItems = items;
      return;
    }
    const forOf = this.forOf;
    if (forOf === void 0) {
      return;
    }
    const normalizedItems: unknown[] = [];
    this.forOf.iterate(flags, items, (arr, index, item) => {
      normalizedItems[index] = item;
    });
    this._normalizedItems = normalizedItems;
  }

  /** @internal */
  private _activateAllViews(
    initiator: IHydratedController | null,
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let viewScope: Scope;

    const { $controller, _factory: factory, local, _location: location, items } = this;
    const parentScope = $controller.scope;
    const forOf = this.forOf;
    const newLen = forOf.count(flags, items);
    const views = this.views = Array(newLen);

    forOf.iterate(flags, items, (arr, i, item) => {
      view = views[i] = factory.create().setLocation(location);
      view.nodes.unlink();
      if(this._hasDestructuredLocal) {
        (forOf.declaration as DestructuringAssignmentExpression)!.assign(viewScope = Scope.fromParent(parentScope, BindingContext.create()), this._forOfBinding.locator, item);
      } else {
        viewScope = Scope.fromParent(parentScope, BindingContext.create(local, item));
      }
      setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);

      ret = view.activate(initiator ?? view, $controller, flags, viewScope);
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
    flags: LF,
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
      ret = view.deactivate(initiator ?? view, $controller, flags);
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
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView;

    const { $controller, views } = this;

    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let i = 0;
    for (; deletedLen > i; ++i) {
      view = views[deleted[i]];
      view.release();
      ret = view.deactivate(view, $controller, flags);
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
    flags: LF,
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
      if (__DEV__)
        throw new Error(`AUR0814: viewsLen=${views.length}, mapLen=${mapLen}`);
      else
        throw new Error(`AUR0814:${views.length}!=${mapLen}`);
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
          (this.forOf.declaration as DestructuringAssignmentExpression)!.assign(viewScope = Scope.fromParent(parentScope, BindingContext.create()), this._forOfBinding.locator, normalizedItems![i]);
        } else {
          viewScope = Scope.fromParent(parentScope, BindingContext.create(local, normalizedItems![i]));
        }
        setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.setLocation(location);

        ret = view.activate(view, $controller, flags, viewScope);
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

function setContextualProperties(oc: IRepeatOverrideContext, index: number, length: number): void {
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
}
